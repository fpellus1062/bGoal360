
const db = require("../db/index.cjs");
const fs = require("fs");
const path = require('path');
//const console = require('console');
const { Console } = require('node:console');

////////////////////////////////////////////////////
// DEFINICIONES GLOBALES Y DECLARACIONES
///////////////////////////////////////////////////.
console.log(path.join(__dirname, '../'));
const output = fs.createWriteStream(path.join(__dirname, '../console.log'));
const errorOutput =  fs.createWriteStream(path.join(__dirname, '../error.log'));
// Custom simple logger
const logger = new Console({ stdout: output, stderr: errorOutput });

const EMPRESA = {
  id: "",
  empresa_id: "",
  nombre: "",
  ejercicio_inicio: "",
  ejercicio_fin: "",
  ejercicio_descripcion: "",
  ruta: "",
  idcodigo: "",
  idlayout: "",
  descripcionlay: "",
  version: "",
  fechaalta: ""
};
var esquemalin_lay = {
  id: "",
  esquema_lin_id: "",
  fila_col: "",
  descripcion: "",
  pass: "",
  nivel: "",
  grupo: "",
  esquema_cab_lay_id: "",
};
var niveles = {
  id: [],
  pass: [],
  nivel: [],
  esquema: [],
};
module.exports = {
  async leerdatosoriginal(ocodigo, oversion) {
    logger.time("Log: leerdatosoriginal", ocodigo);
    const client = await db.getClient();
    registros = "";
    // LEEMOS LOS DATOS EN ORDEN DE IDX (DEPENDENCIA)
    try {
      sqlstring =
        "SELECT dl.id,l.esquema_cab_lay_id,dl.idx,dl.response,dl.literal,dl.datos,dl.nivel,dl.clave FROM esquemas_layout_lin l, esquemas_data_lin dl " +
        "WHERE  l.fila_col ='F' AND l.esquema_cab_lay_id = $1 AND dl.version = $2 AND l.id = dl.esquema_lin_lay_id " +
        "AND  l.id = dl.esquema_lin_lay_id  ORDER BY dl.idx;";
      await client
        .query(sqlstring, [ocodigo, oversion])
        .then((data) => {
          registros = data;
        })
        .catch((error) => {
          logger.error("Error: " + error.message);
          res.render("error", { merror: error.message });
        });
    } catch (e) {
      throw new Error(e.message);
    } finally {
      client.release();
      logger.timeEnd("Log: leerdatosoriginal", ocodigo);
      return registros;
    }
  },
  async leerfilaoriginal(ocodigo, id) {
    logger.log("Log: leerfilaoriginal", ocodigo, id);
    const client = await db.getClient();
    registros = "";
    try {
      sqlstring =
        "SELECT l.id,l.esquema_cab_lay_id,dl.idx,dl.response,dl.literal,dl.clave,dl.datos,dl.nivel FROM esquemas_layout_lin l, esquemas_data_lin dl " +
        "WHERE  l.fila_col ='F' AND l.esquema_cab_lay_id = $1 and  l.id = dl.esquema_lin_lay_id " +
        "AND   l.id = dl.esquema_lin_lay_id AND dl.idx = $2 ORDER BY dl.idx;";
      await client
        .query(sqlstring, [ocodigo, id])
        .then((data) => {
          registros = data;
        })
        .catch((error) => {
          logger.error("Error: " + error.message);
          res.render("error", { merror: error.message });
        });
    } catch (e) {
      throw new Error(e.message);
    } finally {
      client.release();
      return registros;
    }
  },
  async leeresquema(layout_id, version_id) {
    logger.log("Log: leeresquema", layout_id);
    const client = await db.getClient();

    await client
      .query(
        "SELECT e.id,e.path,elcab.codigo,elcab.id as idlayout,elcab.descripcion as descripcionlay,elcab.version,to_char(elcab.fechaalta,'DD/MM/YYYY') AS fechaalta FROM empresas_config e, esquemas_cab ecab, esquemas_layout_cab elcab WHERE  e.id = ecab.empresa_id and ecab.id = elcab.esquemas_cab_id and  elcab.id = $1 AND elcab.version = $2",
        [layout_id, version_id]
      )
      .then((data) => {
        EMPRESA.ruta = data.rows[0].path;
        EMPRESA.id = data.rows[0].id;
        EMPRESA.idcodigo = data.rows[0].codigo;
        EMPRESA.idlayout = data.rows[0].idlayout;
        EMPRESA.descripcionlay = data.rows[0].descripcionlay;
        EMPRESA.version = data.rows[0].version;
        EMPRESA.fechaalta = data.rows[0].fechaalta;
        
      })
      .catch((error) => {
        logger.error("Error: " + error.message);
        throw new Error(error.message);
      });

  },
  async leerempresa(id_empresa) {
    logger.log(new Date().toLocaleString(),"#Log: leerempresa",id_empresa);
    const client = await db.getClient();
    try {
      var data = await client
        .query(
          "SELECT id,path,nombre, ejercicio_inicio, ejercicio_fin, ejercicio_descripcion,empresa_id FROM empresas_config where id = $1",
          [id_empresa]
        )
        .then((data) => {
          EMPRESA.ruta = data.rows[0].path;
          EMPRESA.id = data.rows[0].id;
          EMPRESA.nombre = data.rows[0].nombre;
          EMPRESA.empresa_id = data.rows[0].empresa_id;
          EMPRESA.ejercicio_descripcion = data.rows[0].ejercicio_descripcion;
          EMPRESA.ejercicio_inicio = data.rows[0].ejercicio_inicio;
          EMPRESA.ejercicio_fin = data.rows[0].ejercicio_fin;
        })
        .catch((error) => {
          logger.error("Error: " + error.message);
          throw new Error(error.message);
        });
    } catch (error) {
      logger.error("Error: " + error.message);
      throw new Error(error.message);
    } finally {
      logger.log(new Date().toLocaleString(),"#En /objetivos (leerempresa)....: ");
      return EMPRESA;
    }
  },
  // Leemos lista de Layouts para una empresa
  async leerlayout(empresa_id) {
    logger.log("Log: leerlayouts", empresa_id);
    const client = await db.getClient();
    try {
      lays = [];
      var sqlstring = "";
      sqlstring +=
        "select lc.id AS id, lc.response,ec.id AS empresa,ec.nombre, ec.ejercicio_descripcion,lc.codigo AS codigo, lc.version, ";
      sqlstring +=
        "lc.descripcion AS descripcion,to_char(lc.fechaalta,'DD/MM/YYYY') AS fecha,lc.observaciones AS observaciones ";
      sqlstring +=
        "FROM esquemas_cab e,esquemas_layout_cab lc, empresas_config ec ";
      sqlstring +=
        "where ec.id = e.empresa_id  AND e.empresa_id = $1 AND lc.esquemas_cab_id = e.id ORDER BY lc.fechaoperacion DESC; ";

      await client
        .query(sqlstring, [empresa_id])
        .then((data) => {
          data.rows.forEach((element) => {
            lays.push(element);
          });
        })
        .catch((error) => {
          logger.error("Error: " + error.message);
          res.render("error", { merror: error.message });
        });
      client.release();
      return lays;
    } catch (e) {
      throw new Error(e.message);
    }
  },
  async updatelayout(layout_id, col, newvalor) {
    const client = await db.getClient();
    var result = 0;
    try {
      querystring =
        "UPDATE esquemas_layout_cab c set " +
        col +
        "=$2, fechaoperacion = $3 WHERE id=$1";
      await client
        .query(querystring, [layout_id, newvalor, "now()"])
        .then((data) => {
          result = data.rowCount;
        })
        .catch((error) => {
          logger.error("Error: " + error.message);
          res.render("error", { merror: error.message });
        });
    } catch (e) {
      throw new Error(e.message);
    } finally {
      client.release();
      return result;
    }
  },

  // Leemos Resumen Datos Layout y Cabecera
  async leerresumen(empresa_id, layout_id) {
    logger.log("Log: leerresumen", empresa_id);
    const client = await db.getClient();
    try {
      resumen = [];
      querystring =
        "SELECT ec.empresa_id,em.nombre AS empresa,ec.fichero||'.'||ec.ext as fichero,ec.observaciones as descripcion_cab, c.codigo,c.descripcion AS nombre,c.observaciones, dl.nivel,dl.descripcion,count(distinct dl.literal),c.version ";
      querystring +=
        "FROM esquemas_layout_cab c,esquemas_layout_lin l, esquemas_data_lin dl, esquemas_cab ec, empresas_config em ";
      querystring +=
        "WHERE  ec.id = c.esquemas_cab_id AND c.id = l.esquema_cab_lay_id and  l.id = dl.esquema_lin_lay_id ";
      querystring +=
        "AND  l.id = dl.esquema_lin_lay_id AND em.id = ec.empresa_id  AND dl.nivel > 0 AND ec.empresa_id =$1  AND c.id = $2 AND c.version = 'VP' ";
      querystring +=
        "GROUP BY ec.empresa_id,em.nombre,ec.fichero||'.'||ec.ext,ec.observaciones,c.codigo,c.descripcion,c.observaciones,dl.nivel,dl.descripcion,c.version  ORDER by dl.nivel;";
      await client
        .query(querystring, [empresa_id, layout_id])
        .then((data) => {
          data.rows.forEach((element) => {
            resumen.push(element);
          });
        })
        .catch((error) => {
          logger.error("Error: " + error.message);
          res.render("error", { merror: error.message });
        });
    } catch (error) {
      throw new Error(error.message);
    } finally {
      client.release();
      return resumen;
    }
  },
  // Estadistica Analisis Pareto
  async pareto(layout_id, nivel) {
    logger.log("Log: leerpareto", layout_id, nivel);
    const client = await db.getClient();
    var paretos = [];
    try {
      var porcentaje = 80;
      querystring =
        " SELECT literal, SUM((dl.datos ->> 'Tot')::float) as total, SUM((dl.datos ->> 'Tot')::float)/total*100 as percent  FROM ( ";
      querystring +=
        "SELECT SUM((dl.datos ->> 'Tot')::float) as total  FROM esquemas_layout_lin l, esquemas_data_lin dl ";
      querystring +=
        "WHERE  l.fila_col ='F' AND l.esquema_cab_lay_id = $1 AND  dl.nivel = $2 ";
      querystring +=
        "AND l.id = dl.esquema_lin_lay_id AND  l.id = dl.esquema_lin_lay_id GROUP BY dl.nivel) AS tabla, ";
      querystring +=
        "esquemas_layout_lin l, esquemas_data_lin dl WHERE  l.fila_col ='F' AND l.esquema_cab_lay_id = $1 AND  dl.nivel = $2 ";
      querystring +=
        "AND l.id = dl.esquema_lin_lay_id AND  l.id = dl.esquema_lin_lay_id GROUP BY  dl.literal, tabla.total ";
      querystring += "order by percent DESC ;";
      await client
        .query(querystring, [layout_id, nivel])
        .then((data) => {
          var tope = 0;
          var resto = 0;
          var ochenta = 0;
          var posicion = 0;
          var restoposicion = 0;
          for (var j = 0; j < data.rowCount; j++) {
            if (tope <= porcentaje) {
              posicion += 1;
              paretos.push({
                literal: data.rows[j].literal.toUpperCase(),
                percent: data.rows[j].percent,
                posicion: posicion,
                total: Intl.NumberFormat("es-512").format(
                  data.rows[j].total.toFixed(2)
                ),
              });
              tope += data.rows[j].percent;
              ochenta += data.rows[j].total;
              logger.log(
                Intl.NumberFormat("es-ES").format(data.rows[j].total.toFixed(2))
              );
            } else {
              resto += data.rows[j].total;
              restoposicion += 1;
            }
          }
          paretos.push({ literal: "", percent: 0, posicion: 0, total: 0 });
          paretos.push({
            literal: "OCHENTA %",
            percent: tope.toFixed(2),
            posicion: posicion,
            total: Intl.NumberFormat("es-512").format(ochenta.toFixed(2)),
          });
          var restoporcentaje = 100 - tope;
          paretos.push({
            literal: "RESTO",
            percent: restoporcentaje.toFixed(2),
            posicion: restoposicion,
            total: Intl.NumberFormat("es-512").format(resto.toFixed(2)),
          });
        })
        .catch((error) => {
          logger.error("Error: " + error.message);
          res.render("error", { merror: error.message });
        });
    } catch (e) {
      throw new Error(e.message);
    } finally {
      client.release();
      return paretos;
    }
  },
  //LEERNIVELES
  async leerniveles(layout) {
    logger.log("Log: leerniveles", layout);
    const client = await db.getClient();
    var orden = {
      id: [],
      pass: [],
      nivel: [],
      esquema: [],
    };
    try {
      await client
        .query(
          "SELECT l.* FROM esquemas_layout_lin l 	WHERE l.fila_col ='F'  and esquema_cab_lay_id = $1 ORDER BY id",
          [layout]
        )
        .then((data) => {
          data.rows.forEach((element) => {
            orden.id.push(element.id);
            orden.pass.push(element.pass);
            orden.nivel.push(element.nivel);
            orden.esquema = element.grupo.split(".");
          });
        })
        .catch((error) => {
          logger.error("Error: " + error.message);
          res.render("error", { merror: error.message });
        });
    } catch (e) {
      throw new Error(e.message);
    } finally {
      client.release();

      return orden;
    }
  },
  // Leer Descripcion  Columna de Resumen de Datos
  async leerlinlay(fila_col, layout) {
  
    const client = await db.getClient();
    try {
      await client
        .query(
          "SELECT l.* FROM esquemas_layout_lin l WHERE l.fila_col =$1  and esquema_cab_lay_id = $2  ORDER BY l.grupo DESC",
          [fila_col, layout]
        )
        .then((data) => {
          esquemalin_lay.id = data.rows[0].id;
          esquemalin_lay.esquema_lin_id = data.rows[0].esquema_lin_id;
          esquemalin_lay.fila_col = data.rows[0].fila_col;
          esquemalin_lay.descripcion = data.rows[0].descripcion;
          esquemalin_lay.pass = data.rows[0].pass;
          esquemalin_lay.nivel = data.rows[0].nivel;
          esquemalin_lay.grupo = data.rows[0].grupo;
          esquemalin_lay.esquema_cab_lay_id = data.rows[0].esquema_cab_lay_id;
        })
        .catch((error) => {
          logger.error("Error: " + error.message);
          res.render("error", { merror: error.message });
        });
    } catch (e) {
      throw new Error(e.message);
    } finally {
      client.release();
      return esquemalin_lay;
    }
  },
  // Leemos Resumen Datos Layout y Cabecera
  async leerpadre(layout_id) {
    logger.log("Log: leerpadre", layout_id);
    const client = await db.getClient();
    try {
      var resumen = "";
      querystring =
        "select c.response FROM esquemas_layout_cab c where c.id = $1;";
      await client
        .query(querystring, [layout_id])
        .then((data) => {
          resumen = data;
        })
        .catch((error) => {
          logger.error("Error: " + error.message);
          res.render("error", { merror: error.message });
        });
    } catch (error) {
      throw new Error(error.message);
    } finally {
      client.release();
      return resumen.rows[0].response;
    }
  },
  // Leer Valores unicos Clave para la seleccion del Padre en Objetivo Next
  async leerselector(esquema_id, nivel) {
    logger.log("Log: leerselector", esquema_id, nivel);
    const client = await db.getClient();
    try {
      seleccion = [];
      await client
        .query(
          "SELECT distinct clave,descripcion ||': '|| clave  as col FROM public.esquemas_data_lin WHERE esquema_lin_lay_id = $1 AND nivel = $2 ORDER BY clave ",
          [esquema_id, nivel]
        )
        .then((data) => {
          data.rows.forEach((element) => {
            seleccion.push(element);
          });
        })
        .catch((error) => {
          logger.error("Error: " + error.message);
          res.render("error", { merror: error.message });
        });
    } catch (e) {
      throw new Error(e.message);
    } finally {
      client.release();
      return seleccion;
    }
  },
};