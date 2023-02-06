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
import matplotlib.pyplot as plt

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

    sqlstring = "SELECT dl.id,(dl.datos ->> 'Tot')::float as total,(dl.datos ->> 'Ene')::float as ene  FROM esquemas_layout_lin l, esquemas_data_lin dl , esquemas_layout_cab c "
    sqlstring +="WHERE  l.fila_col ='F' AND  c.id = l.esquema_cab_lay_id AND dl.version = '"+str(VERSION)+"' AND c.id = '"+ str(LAYID)
    sqlstring +="' AND l.id = dl.esquema_lin_lay_id AND  l.id = dl.esquema_lin_lay_id AND dl.nivel = 4;"    
    camino = "C:/Desarrollo/bGoal360/data/02/"
    #f = read_sql_tmpfile(sqlstring,alchemyEngine,camino)

    dataBBDD = pd.read_sql(sqlstring, dbConnection);
   
    datos = pd.json_normalize(dataBBDD)
    #ids = dataBBDD.id
    #datos.insert(0,'id',value=ids)
    # Close the database connection
    dbConnection.close()
    return  dataBBDD; 

def main():
    data = leemosfichero(LAYID,NIVEL)
    print(data)
    tabla = data.to_numpy()
    print(data['ene'].describe())
    print(tabla)
    #plt.hist(samples, bins=100, density=True)
    #plt.show()

# Start process
if __name__ == '__main__':
    main()