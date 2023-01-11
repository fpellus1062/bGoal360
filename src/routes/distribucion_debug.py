

import logging
from logging import config
import traceback
import numpy as np
import pandas as pd
import math
import psycopg2 as db
from json import JSONEncoder
import sys, json
import tempfile
from sqlalchemy import create_engine
import seaborn as se

#Definimos constantes, globales, parametros, etc...
EMPRESA = 28
LAYID =  357
NIVEL =  1
VERSION = 'VP'
se.set()

logging.basicConfig(
level=logging.INFO,
format="%(asctime)s [%(levelname)s] %(message)s",
handlers=[
    logging.FileHandler("debug.log"),
    logging.StreamHandler(sys.stdout)
    ]
)

conn = db.connect(
    host="localhost",
    database="bSales",
    user="miweb",
    password="Nix100sslfj18"
    )


# Creamos la instancia del Motor
alchemyEngine   = create_engine('postgresql+psycopg2://miweb:Nix100sslfj18@localhost:5432/bSales?client_encoding=utf8', pool_recycle=3600)

def read_sql_tmpfile(query, db_engine,camino):
    with tempfile.TemporaryFile(prefix=camino,delete=False) as tmpfile:
        copy_sql = "COPY ({query}) TO STDOUT WITH CSV {head}".format(
           query=query, head="HEADER"
        )
        conn = db_engine.raw_connection()
        cur = conn.cursor()
        cur.copy_expert(copy_sql, tmpfile)
        tmpfile.seek(0)
        df = pd.read_csv(tmpfile,index_col=None)
        return df
    
def  leemosfichero(layid,nivel):  
    # Connect to PostgreSQL server
    dbConnection    = alchemyEngine.connect()
    
    sqlstring = "SELECT SUM((dl.datos ->> 'Tot')::float) as datos FROM esquemas_layout_lin l, esquemas_data_lin dl , esquemas_layout_cab c "
    sqlstring +="WHERE  l.fila_col ='F' AND  c.id = l.esquema_cab_lay_id AND dl.version = '"+str(VERSION)+"' AND c.id = '"+ str(LAYID) +"' AND  dl.nivel = "+str(NIVEL)+" " 
    sqlstring +="AND l.id = dl.esquema_lin_lay_id AND  l.id = dl.esquema_lin_lay_id GROUP BY dl.clave;"    
    camino = "C:/Desarrollo/bSales360/data/02/"
    #f = read_sql_tmpfile(sqlstring,alchemyEngine,camino)
    #dataBBDD       = pd.read_sql(sqlstring, dbConnection,params=[LAYID,NIVEL]);  
    dataBBDD       = pd.read_sql(sqlstring, dbConnection);  
    # Close the database connection
    dbConnection.close()
    
    return  np.array(dataBBDD.astype('float').round(2))
def main():
       
    #Nombre del Fichero
    fichero = ""
   
    data = leemosfichero(LAYID,NIVEL)
    if (data.size > 0):
        datos = data[:,:].flatten()
        pd.set_option('display.precision', 2)
        # Cálculo del número de intervalos
        # Si la parte entera de k es un número impar, redondeamos a la baja
        k = 1 + 3.322 * math.log10(len(datos))
        numero = int(k)
        if numero % 2 == 0:
            periodos = math.ceil(k)
        else:
            periodos = int(k)

        inf = datos.min()        # Limite inferior del primer intervalo
        dif = datos.max()
        sup = datos.max() + 1    # Limite superior del último intervalo
        #periodos = 12
        intervals = pd.interval_range(
            start=round(inf-100,0),
            end=round(sup+100,0),
            periods=periodos,
            name="Intervalo",
            closed="left")
    
        df = pd.DataFrame(index=intervals)
    
        df["FreqAbs"] = pd.cut(datos, bins=df.index).value_counts()
        suma = df["FreqAbs"].sum(axis=0)
        df["Marca"]  = df.index.mid
        df["LimInf"] = df.index.left
        df["LimSup"] = df.index.right
        df["Intervalos"] = 'de '+df["LimInf"].round(0).apply(str) + ' a ' +df["LimSup"].round(0).apply(str)
        df["FreqRel"] = round(df["FreqAbs"] / suma * 100,2)
    
        #print(df)
        #print(df.to_json())

        result = df.to_json(orient="records")
        #parsed = json.loads(result)
        #print(json.dumps(parsed, indent=4))
        print(result)
    else:
        print({})
# Start process
if __name__ == '__main__':
    main()