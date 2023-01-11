const db = require("../db/index.cjs");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
//const console = require('console');
const { Console } = require("node:console");

// const conObject = {
//   user: process.env.pgUSER,
//   host: process.env.pgHOST,
//   database: process.env.pgDATABASE,
//   password: process.env.pgPASS,
//   port: process.env.pgPORT,
// };

// const pool = new Pool(conObject);
// pool.connect();

////////////////////////////////////////////////////
// DEFINICIONES GLOBALES Y DECLARACIONES
///////////////////////////////////////////////////.
console.log(path.join(__dirname, "../"));
const output = fs.createWriteStream(path.join(__dirname, "../console.log"));
const errorOutput = fs.createWriteStream(path.join(__dirname, "../error.log"));
// Custom simple logger
const logger = new Console({ stdout: output, stderr: errorOutput });

var EMPRESA = {
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
	fechaalta: "",
	fechaactualizacion: "",
	usuario: "",
	observaciones: "",
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
		registros = "";
		// LEEMOS LOS DATOS EN ORDEN DE IDX (DEPENDENCIA)
		try {
			sqlstring =
				"SELECT dl.id,l.esquema_cab_lay_id,dl.idx,dl.response,dl.literal,dl.datos,dl.nivel,dl.clave " +
				"FROM esquemas_layout_lin l, esquemas_data_lin dl, esquemas_layout_cab c " +
				"WHERE  l.fila_col ='F'  AND  COALESCE(c.response,c.id) = l.esquema_cab_lay_id " +
				"AND c.id = $1 AND c.version = dl.version AND c.version = $2 AND l.id = dl.esquema_lin_lay_id " +
				"AND  l.id = dl.esquema_lin_lay_id  ORDER BY dl.idx;";
			await db
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
			logger.timeEnd("Log: leerdatosoriginal", ocodigo);
			return registros;
		}
	},
	async leerfilaoriginal(ocodigo, id) {
		logger.log("Log: leerfilaoriginal", ocodigo, id);

		registros = "";
		try {
			sqlstring =
				"SELECT l.id,l.esquema_cab_lay_id,dl.idx,dl.response,dl.literal,dl.clave,dl.datos,dl.nivel " +
				"FROM esquemas_layout_lin l, esquemas_data_lin dl, esquemas_layout_cab c " +
				"WHERE  l.fila_col ='F' AND  COALESCE(c.response,c.id) = l.esquema_cab_lay_id AND c.id = $1 and  l.id = dl.esquema_lin_lay_id " +
				"AND   l.id = dl.esquema_lin_lay_id AND dl.idx = $2 AND c.version = dl.version ORDER BY dl.idx;";
			await db
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
			return registros;
		}
	},
	async leeresquema(layout_id, version_id) {
		try {
			var data = await db.query(
				"SELECT e.id,e.path,elcab.codigo,elcab.id as idlayout,elcab.descripcion as descripcionlay,elcab.version,to_char(elcab.fechaalta,'DD/MM/YYYY') AS fechaalta, " +
					"to_char(elcab.fechaoperacion,'DD/MM/YYYY HH24:MI')  AS fechaactualizacion, usu.nombre||' '||usu.apellido1 as usuario, elcab.observaciones " +
					"FROM empresas_config e, esquemas_cab ecab, esquemas_layout_cab elcab,usuarios usu " +
					"WHERE  e.id = ecab.empresa_id and ecab.id = elcab.esquemas_cab_id and usu.id = elcab.userid and  elcab.id = $1 AND elcab.version = $2",
				[layout_id, version_id]
			);
			if (data.rowCount > 0) {
				EMPRESA.ruta = data.rows[0].path;
				EMPRESA.id = data.rows[0].id;
				EMPRESA.idcodigo = data.rows[0].codigo;
				EMPRESA.idlayout = data.rows[0].idlayout;
				EMPRESA.descripcionlay = data.rows[0].descripcionlay;
				EMPRESA.version = data.rows[0].version;
				EMPRESA.fechaalta = data.rows[0].fechaalta;
				EMPRESA.fechaactualizacion = data.rows[0].fechaactualizacion;
				EMPRESA.usuario = data.rows[0].usuario;
				EMPRESA.observaciones = data.rows[0].observaciones;
				logger.log(
					new Date().toLocaleString(),
					"#En /objetivos (leeresquema)....: ",
					layout_id
				);
				return EMPRESA;
			} else {
				return false;
			}
		} catch (error) {
			logger.error(new Date().toLocaleString(), error.message);

			return false;
		} finally {
			//await client.release();
		}
	},
	async leerempresa(id_empresa) {
		logger.log(
			new Date().toLocaleString(),
			"#Log: leerempresa",
			id_empresa
		);
		try {
			var data = await db.query(
				"SELECT id,path,nombre, ejercicio_inicio, ejercicio_fin, ejercicio_descripcion,empresa_id FROM empresas_config where id = $1",
				[id_empresa]
			);
			if (data.rowCount > 0) {
				EMPRESA.ruta = data.rows[0].path;
				EMPRESA.id = data.rows[0].id;
				EMPRESA.nombre = data.rows[0].nombre;
				EMPRESA.empresa_id = data.rows[0].empresa_id;
				EMPRESA.ejercicio_descripcion =
					data.rows[0].ejercicio_descripcion;
				EMPRESA.ejercicio_inicio = data.rows[0].ejercicio_inicio;
				EMPRESA.ejercicio_fin = data.rows[0].ejercicio_fin;
				logger.log(
					new Date().toLocaleString(),
					"#En /objetivos (leerempresa)....: "
				);
				return EMPRESA;
			} else {
				return false;
			}
		} catch (error) {
			logger.error(new Date().toLocaleString(), error);
			return false;
		} finally {
			//await client.release();
		}
	},
	// Leemos lista de Layouts para una empresa
	async leerlayout(empresa_id) {
		logger.log("Log: leerlayouts", empresa_id);

		try {
			lays = [];
			var sqlstring = "";
			sqlstring =
				"select lc.id AS id, lc.response,ec.empresa_id AS empresa,ec.nombre, ec.ejercicio_descripcion,lc.codigo AS codigo, lc.version, ";
			sqlstring +=
				"lc.descripcion AS descripcion,to_char(lc.fechaalta,'DD/MM/YYYY') AS fecha, to_char(lc.fechaoperacion,'DD/MM/YYYY HH24:MI')  AS fechaactualizacion, usu.nombre||' '||usu.apellido1 as usuario, ";
			sqlstring += "lc.observaciones AS observaciones ";
			sqlstring +=
				"FROM esquemas_cab e,esquemas_layout_cab lc, empresas_config ec , usuarios usu ";
			sqlstring +=
				"where ec.id = e.empresa_id AND  usu.id = lc.userid AND e.empresa_id = $1 AND lc.esquemas_cab_id = e.id ORDER BY lc.fechaoperacion DESC;";

			await db
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
			return lays;
		} catch (e) {
			throw new Error(e.message);
		}
	},
	async updatelayout(layout_id, col, newvalor) {
		var result = 0;
		try {
			querystring =
				"UPDATE esquemas_layout_cab c set " +
				col +
				"=$2, fechaoperacion = $3 WHERE id=$1";
			await db
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
			return result;
		}
	},

	// Leemos Resumen Datos Layout y Cabecera
	async leerresumen(empresa_id, layout_id) {
		logger.log("Log: leerresumen", empresa_id);
		try {
			resumen = [];
			querystring =
				"SELECT ec.empresa_id,em.nombre AS empresa,ec.fichero||'.'||ec.ext as fichero,ec.observaciones as descripcion_cab, c.codigo,c.descripcion AS nombre,c.observaciones, dl.nivel,dl.descripcion,count(distinct dl.literal),c.version ";
			querystring +=
				"FROM esquemas_layout_cab c,esquemas_layout_lin l, esquemas_data_lin dl, esquemas_cab ec, empresas_config em ";
			querystring +=
				"WHERE  ec.id = c.esquemas_cab_id AND COALESCE(c.response,c.id) = l.esquema_cab_lay_id and  l.id = dl.esquema_lin_lay_id ";
			querystring +=
				"AND  l.id = dl.esquema_lin_lay_id AND em.id = ec.empresa_id  AND dl.nivel > 0 AND ec.empresa_id = $1 AND c.id = $2 AND dl.version = c.version ";
			querystring +=
				"GROUP BY ec.empresa_id,em.nombre,ec.fichero||'.'||ec.ext,ec.observaciones,c.codigo,c.descripcion,c.observaciones,dl.nivel,dl.descripcion,c.version  ORDER by dl.nivel;";
			await db
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
			return resumen;
		}
	},
	// Estadistica Analisis Pareto
	async pareto(layout_id, nivel, version) {
		logger.log("Log: leerpareto", layout_id, nivel);

		var paretos = [];
		try {
			var porcentaje = 80;
			querystring =
				"SELECT literal, SUM((dl.datos ->> 'Tot')::float) as total, SUM((dl.datos ->> 'Tot')::float)/total*100 as percent  " +
				"FROM ( SELECT SUM((dl.datos ->> 'Tot')::float) as total  FROM esquemas_layout_lin l, esquemas_data_lin dl, esquemas_layout_cab c " +
				"WHERE  l.fila_col ='F' AND l.esquema_cab_lay_id = c.id AND c.id = $1 AND  dl.nivel = $2  AND l.id = dl.esquema_lin_lay_id AND  l.id = dl.esquema_lin_lay_id " +
				"AND dl.version = $3 GROUP BY dl.nivel) AS tabla,esquemas_layout_lin l, esquemas_data_lin dl, esquemas_layout_cab c  " +
				"WHERE  l.fila_col ='F' AND  dl.nivel = $2  AND  l.esquema_cab_lay_id = c.id and l.id = dl.esquema_lin_lay_id " +
				"AND  c.id = $1 AND dl.nivel = $2 AND dl.version = $3 GROUP BY  dl.literal, tabla.total order by percent DESC;";
			await db
				.query(querystring, [layout_id, nivel, version])
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
								Intl.NumberFormat("es-ES").format(
									data.rows[j].total.toFixed(2)
								)
							);
						} else {
							resto += data.rows[j].total;
							restoposicion += 1;
						}
					}
					paretos.push({
						literal: "",
						percent: 0,
						posicion: 0,
						total: 0,
					});
					paretos.push({
						literal: "OCHENTA %",
						percent: tope.toFixed(2),
						posicion: posicion,
						total: Intl.NumberFormat("es-512").format(
							ochenta.toFixed(2)
						),
					});
					var restoporcentaje = 100 - tope;
					paretos.push({
						literal: "RESTO",
						percent: restoporcentaje.toFixed(2),
						posicion: restoposicion,
						total: Intl.NumberFormat("es-512").format(
							resto.toFixed(2)
						),
					});
				})
				.catch((error) => {
					logger.error("Error: " + error.message);
					res.render("error", { merror: error.message });
				});
		} catch (e) {
			throw new Error(e.message);
		} finally {
			return paretos;
		}
	},
	//LEERNIVELES
	async leerniveles(layout) {
		logger.log("Log: leerniveles", layout);
		var orden = {
			id: [],
			pass: [],
			nivel: [],
			esquema: [],
		};
		try {
			await db
				.query(
					"SELECT l.* FROM esquemas_layout_lin l, esquemas_layout_cab c WHERE l.fila_col ='F'  and COALESCE(c.response,c.id) = l.esquema_cab_lay_id AND c.id = $1 ORDER BY id",
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
			return orden;
		}
	},
	// Leer Descripcion  Columna de Resumen de Datos
	async leerlinlay(fila_col, layout) {
		try {
			await db
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
					esquemalin_lay.esquema_cab_lay_id =
						data.rows[0].esquema_cab_lay_id;
				})
				.catch((error) => {
					logger.error("Error: " + error.message);
					res.render("error", { merror: error.message });
				});
		} catch (e) {
			throw new Error(e.message);
		} finally {
			return esquemalin_lay;
		}
	},
	// Leemos el Id del Padre. En caso de ser padre, devolvemos su propio Id
	async leerpadre(layout_id) {
		logger.log("Log: leerpadre", layout_id);
		var resumen = "";
		try {
			querystring =
				"select COALESCE(c.response,c.id) AS id, c.version FROM esquemas_layout_cab c where c.id = $1;";
			padre = await db.query(querystring, [layout_id]);
			if (padre.rowCount > 0) {
				return padre.rows[0];
			} else {
				// Deberia existir siempre. Por si las moscas
				return { id: layout_id, version: "VP" };
			}
		} catch (error) {
			throw new Error(error.message);
		} finally {
		}
	},
};
