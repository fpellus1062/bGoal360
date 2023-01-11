import logging
#from sqlite3 import PARSE_DECLTYPES
import sys, json
from datetime import datetime
from tkinter import NONE
import traceback
from typing import IO
from sympy import *
import pandas as pd;
import seaborn as se;
import numpy as np
import psycopg2 as db
from psycopg2 import sql
from json import JSONEncoder
from array import array


se.set()
logging.basicConfig(
level=logging.INFO,
format="%(asctime)s [%(levelname)s] %(message)s",
handlers=[
    logging.FileHandler("../console_py.log"),
    logging.StreamHandler(sys.stdout)
    ]
)      
conn = db.connect(
    host="localhost",
    database="bSales",
    user="miweb",
    password="Nix100sslfj18"
    )

# GLOBALES
 #Nombre del Fichero
fichero = ""
#Columnas y Filas
columnas = []
filas = []
datos = []
campos = []
grupo = []
estrategica = []
esquemalin = []
#Nombre de la columna
nombres = []
#Axis  (C) Columna (F) Fila (D) Data
tipo    = [] 
registros = []
meses = []
np_meses = []
lista_meses = ["Ene",	"Feb",	"Mar",	"Abr", "May",	"Jun",	"Jul",	"Ago",	"Sep",	"Oct",	"Nov",	"Dic","Tot"]
####################################
# Esto lo recibimos por parametros #
####################################
EMPRESA = sys.argv[1] 
LAYOUT_ID =  sys.argv[2]
# EMPRESA = 2
# LAYOUT_ID = 318

def  leemosempresa():
    logging.info('Leemos informacion de Empresa')
    # Nuevo Leemos valore de empresas
    sqlstring = "SELECT e.descripcion, e.fichero,e.ext,e.observaciones, "
    sqlstring +="e.orden_col,e.nombre_col,e.tipodato_col,e.fila_col,e.nombre_columna, "
    sqlstring +="e.tipo_nodo,e.grupo,e.id,e.esquema,e.path,e.codigo,e.estrategico,e.esquema_lin_lay_id  FROM v_esquemas e WHERE e.id = %s AND e.esquemas_cab_lay_id =  %s AND e.version = 'VP' ORDER BY e.grupo"
    try:
        cur = conn.cursor()
        cur.execute(sqlstring,(EMPRESA,LAYOUT_ID))
    except BaseException:
        traceback.print_exc()
    finally:
        if cur:
            reg = cur.fetchall()
            cur.close()
    return reg

def  leerpadre(nivel):
    logging.info('Composicion de Arbol. Leemos Padres')
    lnivel = esquemalin[nivel-1]

    sqlstring = "SELECT id,clave,nivel,idx FROM esquemas_data_lin WHERE esquema_lin_lay_id  = %s order by clave;"
    try:
        cur = conn.cursor()
        cur.execute(sqlstring,(lnivel,))
    except BaseException:
        traceback.print_exc()
    finally:
        if cur:
            reg = cur.fetchall()
            cur.close()
    return reg

def insertadata(ruta,nivel,maxnivel):
    logging.info('Composicion de Arbol. Insertamos Datos .....')
    fila = 0
    
    sqlstring = "DELETE from esquemas_data_lin WHERE esquema_lin_lay_id  = ANY (%s);";
    try:
        cur = conn.cursor()
        cur.execute(sqlstring,(esquemalin,))
    except BaseException:
        conn.rollback()
        traceback.print_exc()
    finally:
            if cur:
                conn.commit()
                cur.close()
    for c in range(nivel,maxnivel+1):
        df_s_temp =  pd.read_csv(ruta+'Data_Agrupado_Acum_'+str(c)+'.csv',sep=';',index_col=None)
        cur = conn.cursor()
       
        for idx, row in df_s_temp.iterrows():
            #Contador de filas
            fila += 1
            # Recogemos filtro clave
            cambiar = "()'" 
            literal = row[str(c)]
            clave =   row['Indice']
            #clave = clave.replace(".","_")
            for l in cambiar:
                clave = clave.replace(l,"")
            clave = clave.replace(",","$")
            descripcion = filas[c-1]
            padre = 1
            #Preparamos INSERT del NIVEL (nivel)
        
            nivel = c
            if (row['1'] == '!T_General' and c > 1):
                 continue
            if (row['1'] == '!T_General' and c == 1):
                nivel = 0
                descripcion = '!T_General'
                padre = None
            jsonlist = row.to_json()
            sqlstring = "INSERT INTO esquemas_data_lin(esquema_lin_lay_id, version, clave,descripcion, nivel,idx,literal,response,datos, userid, fechaoperacion) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s);";
            try:
                cur.execute(sqlstring,(esquemalin[c-1],'VP',clave,descripcion,nivel,fila,literal,padre,jsonlist,1,datetime.now()))
                conn.commit()
            except BaseException:
                conn.rollback()
                traceback.print_exc()
        if cur:
            conn.commit()
            cur.close()
    logging.info('Composicion de Arbol. Insertamos Datos Fin ..... '+str(nivel))     
def asignarpadre(nivel,maxnivel):
    
    for c in range(nivel,maxnivel):
        logging.info('Composicion de Arbol. Asigmos Padres a Hijos ..... '+str(c))
        reg = leerpadre(c)
        cur = conn.cursor()
        for i in reg:
            clave = i
            #miclave = clave[1]+'.%'
            miclave = clave[1]+'$%'
            sqlstring = "UPDATE esquemas_data_lin SET response = %s WHERE esquema_lin_lay_id  =  %s AND clave like  %s ;"
            try:
                cur.execute(sqlstring,(clave[3],esquemalin[c],miclave,))
            except BaseException:
                conn.rollback()
                traceback.print_exc()
            ## Actualizamos el Response de la columna JSONB
            sqlstring = """UPDATE esquemas_data_lin d SET "datos"=jsonb_set("datos"::jsonb, '{"""+"""Response}', '%s')  WHERE esquema_lin_lay_id  =  %s AND clave like  %s;"""

            try:
                cur.execute(sqlstring,(clave[3],esquemalin[c],clave[1],))
            except BaseException:
                conn.rollback()
                traceback.print_exc()
        if cur:
            conn.commit()
            cur.close()
    logging.info('Composicion de Arbol. Asigmos Padres a Hijos Fin ..... ')    
def main():

    logging.info(str(EMPRESA)+str(LAYOUT_ID))

    registros = leemosempresa()

    for i in registros:
        if   (i[7] == 'C') :
            columnas.append (i[5])
            grupo.append (i[5])
        elif (i[7] == 'F') :
            filas.append (i[5])
            grupo.append (i[5])
        elif (i[7] == 'R'):
            datos.append (i[5])
        campos.append(i[4])
        nombres.append (i[5])
        tipo.append(i[7])
        estrategica.append (i[15])
        esquemalin.append (i[16])
    NIVEL = 1
    MAXNIVEL = len(filas)
    fichero = registros[0][1]
    camino = registros[0][13]
    ruta = camino+registros[0][14]+'_'
    
    se_temp = pd.read_csv(camino+fichero,sep=";",usecols=campos,header=0,decimal=',')
 
    ## Guardamos los meses con Datos
    columnas_mes = se_temp[columnas].squeeze().unique()
    columnas_mes.sort()
    for column in columnas_mes:
        np_meses.append(lista_meses[column - 1])
    ## Fin 
    
    se_temp[datos] = se_temp[datos].astype(float, errors = 'raise')
    se_matriz = se_temp.groupby(grupo).sum().unstack(columnas)
    se_matriz.fillna(0,inplace=True)
    

    
    se_matriz.to_csv(ruta+'Data_Agrupado.csv',sep=";",decimal=",",index=filas)
    se_original = se_matriz.copy()
    
    for i in filas:
        fe_matriz = se_matriz.groupby(i).sum()
        fe_matriz.to_csv(ruta+'Data_Agrupado_'+i+'.csv',sep=";",decimal=",",index=i)
    # parseamos NaN
    se_original.fillna(0.0)
    
    #Convertimos en Array (NumPy)
    tmp_array = np.array(se_original).astype(float)
    rows, columns = tmp_array.shape
    
    # Creamos NumPy de Meses
    
    #Añadimos las columnas de mes que faltan
    tmp_zeros = np.zeros((rows, 1))
    tmp_meses = np.ndarray(shape=(rows,1),dtype=float)

    for mes in range(len(lista_meses) - 1):
        try:
            if (np_meses.index(lista_meses[mes]) > -1):
                indice = np_meses.index(lista_meses[mes])
                if (indice == 0):
                     tmp_meses =  tmp_array[:,indice].copy()
                else:
                    tmp_meses = np.column_stack((tmp_meses, tmp_array[:,indice]))
        except ValueError:
                tmp_meses = np.column_stack((tmp_meses,tmp_zeros))
               
    
    m_array10 = tmp_meses.copy()
    np.nan_to_num(m_array10,copy=False)
    
    np.savetxt(ruta+'matriz_limpia.csv', m_array10,fmt='%f',delimiter=",")
       
    #Sumamos la matriz con los nuevos elementos
    suma_col = np.sum(m_array10, axis=0)
    suma_fil = np.sum(m_array10, axis=1)
    
    #Añadimos la suma total de las columnas. Ahora tenemos un Array de 13 columnas 12 meses + Total Meses
    f_arraynew = np.column_stack((m_array10,suma_fil))
    
    #Añadimos la suma total de las filas. Ahora tenemos el total de las columnas. Length del array + 1 fila de totales
    c_arraynew = np.sum(f_arraynew, axis=0)
    m_tot_arraynew = np.row_stack((c_arraynew,f_arraynew))
    
    #Guardamos los Totales objetivos Orginales en CSV
   
    rows, columns = m_tot_arraynew.shape
    tt_array = m_tot_arraynew[0]
    #tt_array = np.delete(tt_array,0)
    np.savetxt(ruta+'TT_Original_array.csv', tt_array,fmt='%.2f',delimiter=";")

     # Construimos un Dataframe Añadimos titulos de Mes
   
    
    #Recuperamos las columnas los datos de Indice
    dfg = pd.read_csv(ruta+'Data_Agrupado.csv',sep=";",header=2,decimal=',',index_col=None)
       
    df_original = pd.DataFrame(m_tot_arraynew,columns = lista_meses,index=None)

    # Añadimos 2 filas al DatFrame Original para recuperar las columnas Index
    f_totales = []
    for i in filas:
        f_totales.append('!T_General')
    
    s_totales = pd.Series(f_totales) 
    a_totales = s_totales.values
    r_totales = a_totales.reshape((1, len(filas)))
    df_c = dfg.iloc[:, 0 : len(filas)]
    dft = pd.DataFrame(r_totales,columns=np.array(filas),index=None)
    
    df_c = pd.concat([dft,df_c],ignore_index = true,axis=0)
    # Añadimos columnas de Categoria
  
    df_total = pd.concat([df_c,df_original],axis=1)

   
  # Valores Nulos a Cero y Guardamos. Este fichero servira para realizar el reset de objetivo y partir de nuevo de las ventas originales (matriz.csv)
    df_total = df_total.fillna(0)
    df_total = np.round(df_total,2)  
    
    # Agrupamos por los diferentes niveles del Objetivo
    x = "1";
    f = 0
    for i in filas:
        f += 1
        fe_matriz = df_total.rename(columns={i: x})
        fe_matriz = fe_matriz.groupby(x).sum()
        fe_matriz = np.round(fe_matriz,2)
        fe_matriz.to_csv(ruta+'Data_Agrupado_'+i+'.csv',sep=";",decimal=".",index=i)
        fe_matriz.to_csv(ruta+'Data_Agrupado_'+str(f)+'.csv',sep=";",decimal=".",index=i)
    x = 0;
    for i in filas:
         x += 1
         df_total.rename(columns={i: str(x)},inplace=True)  
    x = 0;
    
    nuevo_grupo = [];
    #Agrupamos en cascada segun niveles y Añadimos Columnas IDx,Response, Nivel
    for  i in range(NIVEL,MAXNIVEL+1):
        nuevo_grupo.append(str(i))
        fe_matriz = df_total.groupby(nuevo_grupo).sum()
        fe_matriz = np.round(fe_matriz,2)
        fe_matriz['Nivel'] = i
        fe_matriz['Idx'] = range(1,len(fe_matriz.index)+1)
        fe_matriz['Response'] = 0
        fe_matriz['Indice'] = list(fe_matriz.index.values)
        fe_matriz.to_csv(ruta+'Data_Agrupado_Acum_'+str(i)+'.csv',sep=";",decimal=".") 
    
    logging.info('Composicion de Arbol. Guardamos en BBDD Inicio .....')
    insertadata(ruta,NIVEL,MAXNIVEL)
    #reg = leerpadre(NIVEL)
    asignarpadre(NIVEL,MAXNIVEL) 
    logging.info('Composicion de Arbol. Guardamos en BBDD Fin.....')   
    # Agrupamos todos los niveles en uno general
    migrupo = []
    for i in filas:
        x += 1
        migrupo.append(str(x))
    fe_matriz = df_total.groupby(migrupo).sum()
    fe_matriz = np.round(fe_matriz,2)
    fe_matriz.to_csv(ruta+'Data_Agrupado.csv',sep=";",decimal=".",index=i)
        
    #Devolvemos el control y Array  JSON al Shell
    w_array = {}
    w_array["objetivos"] = m_tot_arraynew.tolist()
    #print(json.dumps(w_array))
    print (json.dumps('ok'))

# Start process
if __name__ == '__main__':
    main()