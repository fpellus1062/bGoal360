const express = require("express");
//const session = require('express-session');
const formidable = require("formidable");
const fs = require("fs");
const { parse } = require("fast-csv");
const routes = express.Router();
const { PythonShell } = require("python-shell");
//const console = require("console");
const { Console } = require("node:console");
//const { Pool } = require("pg");
const db = require("../db/index.cjs");
const isNumber = require("is-number");
const converter = require("json-2-csv");
const utilidades = require("../modulos/utilidades");
const excel = require("../modulos/excelexports");
const objutilsSql = require("../modulos/objutilsSql");
const path = require("path");
const ExcelJS = require("exceljs");
const csvtojson = require("csvtojson");
const { send } = require("process");

////////////////////////////////////////////////////
// DEFINICIONES GLOBALES Y DECLARACIONES
///////////////////////////////////////////////////

// const conObject = {
//   user: process.env.pgUSER,
//   host: process.env.pgHOST,
//   database: process.env.pgDATABASE,
//   password: process.env.pgPASS,
//   port: process.env.pgPORT,
// };

// const pool = new Pool(conObject);
// pool.connect();
const separador_csv = /;/gi; // Separador ;
const numero_es = /^(-|)+(([0-9]+)(\.?))+(\,?)([0-9]+)$/;
const fecha_es =
	/^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[1,3-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/;
var CODIGO = "";
const meses = [
	"Tot",
	"Ene",
	"Feb",
	"Mar",
	"Abr",
	"May",
	"Jun",
	"Jul",
	"Ago",
	"Sep",
	"Oct",
	"Nov",
	"Dic",
];
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

const output = fs.createWriteStream(path.join(__dirname, "../console.log"));
const errorOutput = fs.createWriteStream(path.join(__dirname, "../error.log"));
// Custom simple logger
const logger = new Console({ stdout: output, stderr: errorOutput });

// pool.on("error", (err, client) => {
//   logger.error("Unexpected error on idle client", err);
//   process.exit(-1);
// });

// Autorizacion Total
// routes.use('/', function(req, res, next){
//   if(!req.session.usuario){
//     res.render('error_login', { leererror: 'No tiene Autorizacion', layout: './layouts/full-width'});
//   }else{
//     next(); // si está logueado continúa la ejecución de los siguientes get
//   }
// });

routes.get("/portada", async (req, res) => {
	var empresa_session = await await utilidades.leerempresasession(
		req.sessionID
	);
	logger.log(
		new Date().toLocaleString(),
		"#Portada Leo Empresa Session ",
		empresa_session
	);

	EMPRESA = await objutilsSql.leerempresa(empresa_session);
	logger.log(
		new Date().toLocaleString(),
		"#Portada Leída Empresa Session ",
		EMPRESA
	);
	// empresas_usuario = await utilidades.cargaempresasusuario(req);
	res.render("portada", {
		title: "Bienvienido a bGoal360",
		// empresasusuarios: empresas_usuario.rows,
		layout: "./layouts/sidebar",
	});
});

// Tratamiento del fichero de datos
routes.get("/confichero", async (req, res) => {
	var empresa_session = await utilidades.leerempresasession(req.sessionID);
	EMPRESA = await objutilsSql.leerempresa(empresa_session);
	req.session.filetext = null;
	var array_campos = [];
	var array_valores = [];
	var array_tipos = [];
	var array_tipo = [];
	var array_estrategico = [];
	res.render("configfile", {
		title: "Configurar Fichero de Datos",
		cab: array_campos,
		lin: array_valores,
		tipos: array_tipos,
		tipo: array_tipo,
		estrategico: array_estrategico,
		fich: "",
		layout: "./layouts/sidebar",
	});
});
////////////////////////////////////////////////////////////////
// Configuramos el fichero de carga de datos
////////////////////////////////////////////////////////////////

routes.post("/confichero", async (req, res, next) => {
	var empresa_session = await utilidades.leerempresasession(req.sessionID);
	EMPRESA = await objutilsSql.leerempresa(empresa_session);
	const form = new formidable.IncomingForm();
	form.parse(req, (err, fields, files) => {
		if (err) {
			console.log(err);
			next(err);
		}
	})
		.on("fileBegin", (name, file) => {
			file.filepath = EMPRESA.ruta + file.originalFilename;
		})
		.on("file", (name, file) => {
			logger.log(
				new Date().toLocaleString(),
				"#Path Subido: ",
				file.filepath.toString()
			);
			// POner la lectura del fichero aqui si no funciona
			let rows = [];
			let nfile = "";
			let cabecera = true;
			var error_campos = false;
			var array_separadores = [];
			var array_campos = [];
			fs.createReadStream(file.filepath)
				.pipe(parse({ headers: false }))
				.on("error", (error) => {
					console.log(error.message);
				})
				.on("data", (row) => {
					//each row can be written to db
					if (cabecera) {
						array_separadores = row.toString().match(separador_csv);
						row = row.toString().replaceAll(" ", "_");
						row = row.toString().replaceAll("/", "_");
						cabecera = false;
					}
					array_valores = row.toString().split(separador_csv);
					row = row.toString().replaceAll(".", "_");
					row = row.toString().replaceAll("'", "_");
					nfile += row + "\n";
					rows.push(row);
					// Comprabamos si hay nulos en el array de valores
					if (!error_campos) {
						error_campos = array_valores.some(haynulos);
					}
				})
				.on("end", (final) => {
					// Exploramos la cabecera del fichero (1ª línea para tomar el separador)
					var array_valores = [];
					var array_tipos = [];
					var array_tipo = [];
					var array_estrategico = [];
					array_separadores = rows[0].toString().match(separador_csv);
					if (
						array_separadores != null &&
						array_separadores.length > 0 &&
						error_campos == false
					) {
						var separador = array_separadores[0];
						// Separamos los campos de la línea de
						array_campos = rows[0].toString().split(separador);
						array_valores = rows[1].toString().split(separador);
						for (i = 0; i < array_valores.length; i++) {
							var numero = es_numero(array_valores[i]);
							if (!numero) {
								//Si no es numero. Es Fecha o String
								array_tipos[i] = array_valores[i].match(
									fecha_es
								)
									? "Fecha"
									: "Texto";
								array_valores[i] = array_valores[i].toString();
								array_estrategico[i] = "E";
							} else {
								array_tipos[i] = "Número";
								array_valores[i] = numero;
								array_estrategico[i] = "O";
							}
						}
					} else {
						// Mensajes de Error
						req.flash(
							"mensajeError",
							"Error en el fichero de Carga: Valores Vacíos"
						);
						req.flash("mensajeOk", null);
					}
					sleep(1000);
					fs.writeFileSync(
						EMPRESA.ruta + "matriz_corregida.csv",
						nfile
					);
					// Set (Array con valores unicos para los tipos de campos )
					array_tipo = [...new Set(array_tipos)];
					//res.render('configfilegrid',{title: 'Configurar Fichero de Datos',fich: file.originalFilename,layout: './layouts/sidebar'});
					res.render("configfile", {
						title: "Configurar Fichero de Datos",
						cab: array_campos,
						lin: array_valores,
						tipos: array_tipos,
						tipo: array_tipo,
						estrategico: array_estrategico,
						fich: file.originalFilename,
						mensajeOk: req.flash("mensajeOk"),
						mensajeError: req.flash("mensajeError"),
						layout: "./layouts/sidebar",
					});
				});
		});
});

////////////////////////////////////////////////////////////////
// Configuramos el fichero de carga de datos
////////////////////////////////////////////////////////////////

routes.post("/conficherogrid", async (req, res) => {
	logger.log(new Date().toLocaleString(), "#Configuracion del Fichero");
	var empresa_session = await utilidades.leerempresasession(req.sessionID);
	EMPRESA = await objutilsSql.leerempresa(empresa_session);
	const form = new formidable.IncomingForm();
	form.parse(req, (err, fields, files) => {
		if (err) {
			logger.error(new Date().toLocaleString(), "#", err);
			throw new Error("Error de captura del fichero", 503);
		}
	})
		.on("fileBegin", (name, file) => {
			file.filepath = EMPRESA.ruta + file.originalFilename;
		})
		.on("file", (name, file) => {
			logger.log(
				new Date().toLocaleString(),
				"#Path Subido: ",
				file.filepath.toString()
			);
			// Guardamos el fichero en Session y Volvemos
			req.session.filetext = file.filepath.toString();
			res.render("configfilegrid", {
				title: "Cargar Fichero de Datos",
				fich:
					file.originalFilename.toString() +
					" Modificado: " +
					file.lastModifiedDate.toLocaleString(),
				layout: "./layouts/sidebar",
			});
		});
});

/// AJAX Call -- Leemos el fichero CSV para alimentar el Grid
routes.post("/getfileCSV", async (req, res, next) => {
	logger.log(
		new Date().toLocaleString(),
		"#AJAX Parseo del Fichero de Datos /getfileCSV ....."
	);
	var empresa_session = await utilidades.leerempresasession(req.sessionID);
	EMPRESA = await objutilsSql.leerempresa(empresa_session);
	let i = 0;
	w_fichero = req.session.filetext;
	// POner la lectura del fichero aqui si no funciona
	let rows = [];
	let nfile = "";
	let cabecera = true;
	if (w_fichero === null) {
		res.sendStatus(200);
	} else {
		fs.createReadStream(w_fichero)
			.pipe(parse({ headers: false }))
			.on("error", (error) => {
				console.log(error.message);
			})
			.on("data", (row) => {
				//each row can be written to db
				if (cabecera) {
					row = row.toString().replaceAll(" ", "_");
					row = row.toString().replaceAll("/", "_");
					cabecera = false;
				}
				row = row.toString().replaceAll(".", "_");
				row = row.toString().replaceAll("'", "_");

				nfile += row + "\n";
				rows.push(row);
			})
			.on("end", (final) => {
				// Exploramos la cabecera del fichero (1ª línea para tomar el separador)
				var regs = [];
				var reg = {};
				var array_separadores = [];
				var array_campos = [];
				var array_valores = [];
				var array_tipos = [];
				var array_estrategico = [];
				array_separadores = rows[0].toString().match(separador_csv);
				if (array_separadores != null && array_separadores.length > 0) {
					var separador = array_separadores[0];
					// Separamos los campos de la línea de
					array_campos = rows[0].toString().split(separador);
					array_valores = rows[1].toString().split(separador);
					for (i = 0; i < array_valores.length; i++) {
						array_campos[i] = array_campos[i]
							.toString()
							.replace(".", "_");
						array_campos[i] = array_campos[i]
							.toString()
							.replace(" ", "_");
						array_campos[i] = array_campos[i]
							.toString()
							.replace("'", "_");
						array_campos[i] = array_campos[i]
							.toString()
							.replace("/", "_");
						reg.id = i;
						reg.nombre_campo = array_campos[i];
						var numero = es_numero(array_valores[i]);
						if (!numero) {
							//Si no es numero. Es Fecha o String
							array_tipos[i] = array_valores[i].match(fecha_es)
								? "Fecha"
								: "Texto";
							array_valores[i] = array_valores[i].toString();
							reg.tipo_dato = array_tipos[i];
							array_estrategico[i] = "Estrategico";
							reg.estrategico = array_estrategico[i];
						} else {
							array_tipos[i] = "Número";
							array_valores[i] = numero;
							reg.tipo_dato = array_tipos[i];
							array_estrategico[i] = "Operativo";
							reg.estrategico = array_estrategico[i];
						}
						reg.valor = array_valores[i];
						reg.nivel = "Sin Asignar";
						reg.tipo_columna = "Sin Asignar";
						regs.push(reg);
						reg = {};
					}
				} else {
					// TODO Lanzan mensaje en pagina Web
					logger.log(
						new Date().toLocaleString(),
						"#El separador debe ser punto y coma ';'"
					);
				}
				sleep(3000);
				fs.writeFileSync(EMPRESA.ruta + "matriz_corregida.csv", nfile);
				res.send(regs);
			});
	}
});
/////////////////////////////////////////////////////////////////
// Grabamos la configuracion del Fichero en BBDD ///////////////
/////////////////////////////////////////////////////////////////

routes.post("/grabarfichero", async (req, res, next) => {
	var usuario = await utilidades.leerusuariosesion(req.sessionID);
	var empresa_session = await utilidades.leerempresasession(req.sessionID);
	EMPRESA = await objutilsSql.leerempresa(empresa_session);
	logger.log(
		new Date().toLocaleString(),
		"#Grabamos Layout",
		req.body.flayout
	);
	fs.rename(
		EMPRESA.ruta + "matriz_corregida.csv",
		EMPRESA.ruta + req.body.fichero,
		() => {
			logger.log(
				new Date().toLocaleString(),
				"#\nFichero cambio nombre!\n"
			);
		}
	);

	// Declaracion de variables
	var data = "";
	var id_cab = "";
	var id_cab_lay = "";
	var id_lin_lay = "";
	var querystring = "";
	var reg = "";
	var reg_ly_C = {
		esquema_lin_id: "",
		fila_col: "",
		descripcion: "",
		pass: "",
		nivel: "",
		esquema_cab_lay_id: "",
		estrategico: "",
	};
	var reg_ly_R = {
		esquema_lin_id: "",
		fila_col: "",
		descripcion: "",
		pass: "",
		nivel: "",
		esquema_cab_lay_id: "",
	};
	var reg_array = [];
	var filas = [];
	var nfilas = [];
	// Inicializacion de variables
	var result = false;
	var fich = req.body.fichero.split(".");
	var columnaresumen = req.body.cabecerasadhow[req.body.idresumen];
	var CODIGO = req.body.flayout;
	var ltree = req.body.flayout;

	nfilas = req.body.idfila.split(",");

	for (var i = 0; i < nfilas.length; i++) {
		filas.push(req.body.cabecerasadhow[nfilas[i]]);
	}
	var f_reg_array = new Array(filas.length);
	(async () => {
		const client = await db.getClient();
		try {
			await client.query("BEGIN");
			querystring =
				"INSERT INTO esquemas_cab " +
				"(descripcion,empresa_id,  path, fichero, ext, observaciones,userid ) values ($1,$2,$3,$4,$5,$6,$7) RETURNING id";
			reg = await client.query(querystring, [
				"Esquema prueba Empresa ACME",
				EMPRESA.id,
				EMPRESA.ruta,
				fich[0],
				fich[1],
				"Fichero con la info ....",
				usuario,
			]);
			id_cab = parseInt(reg.rows[0].id);
			querystring =
				"INSERT INTO esquemas_layout_cab(codigo, descripcion, esquemas_cab_id, observaciones, fechaoperacion,userid,version) VALUES ($1,$2,$3,$4,$5,$6,$7)  RETURNING id";
			reg = await client.query(querystring, [
				CODIGO,
				req.body.namelayout,
				id_cab,
				req.body.comentarios,
				"now()",
				usuario,
				"VP",
			]);
			id_cab_lay = parseInt(reg.rows[0].id);
			for (var i = 0; i < req.body.cabecerasadhow.length; i++) {
				querystring =
					"INSERT INTO esquemas_lin " +
					"(esquemas_cab_id,  orden_col, nombre_col, tipodato_col) values ($1,$2,$3,$4) RETURNING id";
				reg = await client.query(querystring, [
					id_cab,
					i,
					req.body.cabecerasadhow[i],
					queTipo(req.body.idtipos[i]),
				]);
				id_lin_lay = reg.rows[0].id;
				if (filas.indexOf(req.body.cabecerasadhow[i]) > -1) {
					var reg_ly_F = {
						esquema_lin_id: "",
						fila_col: "",
						descripcion: "",
						pass: "",
						nivel: "",
						esquema_cab_lay_id: "",
						estrategico: "",
					};
					var indice = filas.indexOf(req.body.cabecerasadhow[i]);
					reg_ly_F.esquema_lin_id = id_lin_lay;
					reg_ly_F.fila_col = "F";
					reg_ly_F.descripcion = filas[indice];
					reg_ly_F.pass = "N";
					reg_ly_F.nivel = null;
					reg_ly_F.esquema_cab_lay_id = id_cab_lay;
					reg_ly_F.estrategico = req.body.idestrategico[i];
					f_reg_array[indice] = reg_ly_F;

					//f_reg_array.splice(indice, 0, reg_ly_F);
				}
				if (req.body.cabecerasadhow[i].includes(req.body.idcol)) {
					// Aqui se insertan la columna (MES)
					reg_ly_C.esquema_lin_id = id_lin_lay;
					reg_ly_C.fila_col = "C";
					reg_ly_C.descripcion = req.body.idcol;
					reg_ly_C.pass = null;
					reg_ly_C.nivel = 0;
					reg_ly_C.esquema_cab_lay_id = id_cab_lay;
					reg_array.push(reg_ly_C);
					req.body.idcol = null;
				}
				if (req.body.cabecerasadhow[i].includes(columnaresumen)) {
					// Aqui se insertan la columna del campo calculado
					reg_ly_R.esquema_lin_id = id_lin_lay;
					reg_ly_R.fila_col = "R";
					reg_ly_R.descripcion = columnaresumen;
					reg_ly_R.pass = null;
					reg_ly_R.nivel = 0;
					reg_ly_R.esquema_cab_lay_id = id_cab_lay;
					reg_array.push(reg_ly_R);
					columnaresumen = null;
				}
			}
			querystring =
				"INSERT INTO esquemas_layout_lin(esquema_lin_id, fila_col, descripcion, pass, nivel, grupo, esquema_cab_lay_id,bloqueo,estrategico) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)  RETURNING id;";
			for (i = 0; i < filas.length; i++) {
				ltree += "." + f_reg_array[i].descripcion;
				await client.query(querystring, [
					f_reg_array[i].esquema_lin_id,
					f_reg_array[i].fila_col,
					f_reg_array[i].descripcion,
					f_reg_array[i].pass,
					i + 1,
					ltree,
					f_reg_array[i].esquema_cab_lay_id,
					"N",
					f_reg_array[i].estrategico,
				]);
			}

			// Insertamos la columna
			ltree += "." + reg_array[0].descripcion;
			await client.query(querystring, [
				reg_array[0].esquema_lin_id,
				reg_array[0].fila_col,
				reg_array[0].descripcion,
				reg_array[0].pass,
				reg_array[0].nivel,
				ltree,
				reg_array[0].esquema_cab_lay_id,
				"N",
				"N",
			]);

			// Insertamos el dato Resumen
			ltree += "." + reg_array[1].descripcion;
			await client.query(querystring, [
				reg_array[1].esquema_lin_id,
				reg_array[1].fila_col,
				reg_array[1].descripcion,
				reg_array[1].pass,
				reg_array[1].nivel,
				ltree,
				reg_array[1].esquema_cab_lay_id,
				"N",
				"N",
			]);
			await client.query("COMMIT");
			result = true;
			await sleep(1500);
		} catch (error) {
			await client.query("ROLLBACK");
			console.log("ERROR, ROLLBACK");
			next(error);
		} finally {
			client.release();
			if (result) {
				var pyshell = new PythonShell(
					"./src/routes/objetivos_first.py",
					{
						args: [EMPRESA.id, id_cab_lay],
					}
				);
				pyshell.on("message", function (message) {
					// Recibimos la nueva Matriz desde Python y guardamos cada entrada en un String
					data += message;
				});
				pyshell.end(function (error) {
					if (error) {
						next(error);
					}
					//Lanzamos pantalla de trabajo con VP
					res.redirect(
						"/objetivos/tableAjax/?uno=" + id_cab_lay + "&dos=VP"
					);
				});
			} else {
				throw new Error("Problemas con la importacion del fichero");
			}
		}
	})().catch((error) => {
		next(error);
	});
});

//---------------------------------------------
// Recarga de Totales Listado de Ventas Total por AJAX JSON
//---------------------------------------------
routes.post("/getTotalesVentasAjax/:id", async (req, res) => {
	logger.log(
		"Datos AJAX Total Ventas /getTotalesVentasAjax ......",
		req.params.id
	);
	var empresa_session = await utilidades.leerempresasession(req.sessionID);
	EMPRESA = await objutilsSql.leerempresa(empresa_session);

	let rows = [];
	let i = 0;
	w_fichero = EMPRESA.ruta + EMPRESA.idcodigo + "_DF_original_array.csv";
	fs.createReadStream(w_fichero)
		.pipe(parse({ headers: true, delimiter: ";" }))
		.on("error", (error) => console.error(error))
		.on("data", (row) => {
			//each row can be written to db
			rows.push(row);
		})
		.on("end", (final) => {
			totales = [];
			for (i = rows.length - 1; i < rows.length; i++) {
				totales.push(rows[i]);
			}
			res.send(totales);
		});
});
routes.get("/listalayouts", async (req, res) => {
	logger.log(new Date().toLocaleString(), "#Listalayouts  ......");
	res.render("listalayouts", {
		title: "Lista de Layouts Disponibles",
		layout: "./layouts/sidebar",
	});
});
//TODO: Pagina de Listado de Layouts y Versiones. Recibinos id layout y version. Comprobar si existen datos en el Layout
routes.post("/listalayouts", async (req, res) => {
	logger.log(
		new Date().toLocaleString(),
		"#Abrimos Objetivos AJAX /listalayouts",
		req.body.idlayout
	);
	EMPRESA = await objutilsSql.leeresquema(
		req.body.idlayout,
		req.body.idversion
	);

	res.redirect(
		"/objetivos/tableAjax/?uno=" +
			req.body.idlayout +
			"&dos=" +
			req.body.idversion
	);
});
routes.put("/updatelayout", async (req, res) => {
	var empresa_session = await utilidades.leerempresasession(req.sessionID);
	EMPRESA = await objutilsSql.leerempresa(empresa_session);

	logger.log(
		" /updatelayout",
		EMPRESA.id,
		req.body.layout_id,
		req.body.col,
		req.body["newvalor[]"]
	);
	var reg = await objutilsSql.updatelayout(
		req.body.layout_id,
		req.body.col,
		req.body["newvalor[]"]
	);
	logger.log(new Date().toLocaleString(), "#Update Layout", "Ok");
	res.json(reg);
});
//Leemos Listado de Layouts Resumido AJAX (listalyouts)
routes.get("/resumenlayout", async (req, res) => {
	var empresa_session = await utilidades.leerempresasession(req.sessionID);
	EMPRESA = await objutilsSql.leerempresa(empresa_session);

	logger.log(
		new Date().toLocaleString(),
		"# /resumenlayouts",
		empresa_session,
		req.query.layout_id
	);
	var linlay = {};

	//var regpadre = await objutilsSql.leerpadre(req.query.layout_id);
	var regpadre = req.query.layout_id;
	linlay = await objutilsSql.leerlinlay("R", req.query.layout_id);
	var regs = await objutilsSql.leerresumen(
		empresa_session,
		req.query.layout_id
	);
	regs[0].campo_resumen = linlay.descripcion;
	res.send(regs);
});
routes.post("/leerniveleslayout", async (req, res) => {
	logger.log(
		new Date().toLocaleString(),
		"# /leerniveles",
		EMPRESA.id,
		req.body.layout_id
	);
	var regpadre = await objutilsSql.leerpadre(req.body.layout_id);

	var reg = await objutilsSql.leerniveles(regpadre.id);
	res.json(reg);
});
//////////////////////////////////////////////////////////////////////
// Pantall de Analisis de Listalayouts                              //
//////////////////////////////////////////////////////////////////////
routes.get("/analisislay", async (req, res) => {
	logger.log(new Date().toLocaleString(), "#analisislay  ......");
	res.render("analisislay", {
		title: "Análisis de Objetivos",
		layout: "./layouts/sidebar",
	});
});
routes.post("/analisislay", async (req, res) => {
	logger.log(new Date().toLocaleString(), "#Log: analisislay");
	const client = await db.getClient();
	var regs = [];
	// LEEMOS LOS DATOS
	//1. Localizamos el registro padre (response)
	//2. Borramos Lineas y Cabeceras por response
	querystring =
		"SELECT COALESCE (response, id ) as id , codigo, version, descripcion, esquemas_cab_id, observaciones FROM esquemas_layout_cab c WHERE c.id  = $1 ;";
	var idpadre = await client.query(querystring, [req.body.layout_id]);

	sqlstring = "SELECT ";
	sqlstring += "dl.literal as clave,";
	sqlstring += "SUM((dl.datos ->> 'Tot')::float) as Tot,";
	sqlstring += "SUM((dl.datos ->> 'Ene')::float) as Mes1,";
	sqlstring += "SUM((dl.datos ->> 'Feb')::float) as Mes2,";
	sqlstring += "SUM((dl.datos ->> 'Mar')::float) as Mes3,";
	sqlstring += "SUM((dl.datos ->> 'Abr')::float) as Mes4,";
	sqlstring += "SUM((dl.datos ->> 'May')::float) as Mes5,";
	sqlstring += "SUM((dl.datos ->> 'Jun')::float) as Mes6,";
	sqlstring += "SUM((dl.datos ->> 'Jul')::float) as Mes7,";
	sqlstring += "SUM((dl.datos ->> 'Ago')::float) as Mes8,";
	sqlstring += "SUM((dl.datos ->> 'Sep')::float) as Mes9,";
	sqlstring += "SUM((dl.datos ->> 'Oct')::float) as Mes10,";
	sqlstring += "SUM((dl.datos ->> 'Nov')::float) as Mes11,";
	sqlstring += "SUM((dl.datos ->> 'Dic')::float) as Mes12 ";
	sqlstring += "FROM esquemas_layout_lin l, esquemas_data_lin dl ";
	sqlstring += "WHERE  l.fila_col ='F' ";
	sqlstring += "AND l.esquema_cab_lay_id = $1 ";
	sqlstring +=
		" AND l.id = dl.esquema_lin_lay_id AND  l.id = dl.esquema_lin_lay_id ";
	sqlstring +=
		" AND dl.nivel = $2  AND dl.version = $3 GROUP BY dl.literal ORDER by dl.literal ";
	await client
		.query(sqlstring, [
			idpadre.rows[0].id,
			req.body.nivel_id,
			idpadre.rows[0].version,
		])
		.then((data) => {
			for (var i = 0; i < data.rowCount; i++) {
				//var temp = [];
				//temp = data.rows[i].clave.split('$');
				regs.push({
					Clave: data.rows[i].clave,
					Objetivo: parseFloat(data.rows[i].tot),
				});
			}
			client.release();
			res.send(regs);
		})
		.catch((error) => {
			console.log("Error: " + error.message);
			res.render("error", { merror: error.message });
		});
});
routes.get("/pruebas", async (req, res, next) => {
	layout_id = 379;
	version_id = "VP";

	try {
		var empresa_session = await utilidades.leerempresasession(
			req.sessionID
		);
		EMPRESA = await objutilsSql.leerempresa(empresa_session);
		EMPRESA = await objutilsSql.leeresquema(layout_id, version_id);
		var niveles = await objutilsSql.leerniveles(layout_id);
		var linlay = await objutilsSql.leerlinlay("R", layout_id);
		logger.log(
			"Abrimos Prueba ",
			req.params.id,
			EMPRESA.ruta + EMPRESA.idcodigo,
			linlay.descripcion
		);
		res.render("gridfiltro", {
			title: "Grid Objetivos",
			layout: "./layouts/sidebar",
		});
	} catch (error) {
		next(error);
	}
});
//Pagina de trabajo objetivos / presupuestos
routes.get("/tableAjax", async (req, res, next) => {
	layout_id = req.query.uno;
	version_id = req.query.dos;

	try {
		var empresa_session = await utilidades.leerempresasession(
			req.sessionID
		);
		EMPRESA = await objutilsSql.leerempresa(empresa_session);
		EMPRESA = await objutilsSql.leeresquema(layout_id, version_id);
		var niveles = await objutilsSql.leerniveles(layout_id);
		var linlay = await objutilsSql.leerlinlay("R", layout_id);
		logger.log(
			"Abrimos Listado AJAX /tableAjax",
			req.params.id,
			EMPRESA.ruta + EMPRESA.idcodigo,
			linlay.descripcion
		);
		res.render("objestrategico", {
			title: "Grid Objetivos",
			idlayout: layout_id,
			idversion: version_id,
			empresa: EMPRESA,
			codigo: EMPRESA.idcodigo,
			resumen: linlay.descripcion,
			maxnivel: niveles.nivel.length,
			layout: "./layouts/sidebar",
		});
	} catch (error) {
		next(error);
	}
});
///// todo: SERVICIO NUEVO  MIENTRAS LO PENSAMOS SOLO PRUEBA
routes.get("/leoobjetivos", async (req, res) => {
	logger.time("Log: Get Datos Total");
	layout_id = req.query.uno;
	version_id = req.query.dos;
	var registros = await objutilsSql.leerdatosoriginal(layout_id, version_id);
	var regs = [];
	var dato = {};

	for (i = 0; i < registros.rowCount; i++) {
		regs.push({
			Pk: registros.rows[i].id,
			Descripcion: registros.rows[i].literal,
			1: registros.rows[i]["datos"]["1"],
			2: registros.rows[i]["datos"]["2"],
			3: registros.rows[i]["datos"]["3"],
			4: registros.rows[i]["datos"]["4"],
			Tot: parseFloat(registros.rows[i].datos.Tot).toFixed(2),
			Ene: parseFloat(registros.rows[i].datos.Ene).toFixed(2),
			Feb: parseFloat(registros.rows[i].datos.Feb).toFixed(2),
			Mar: parseFloat(registros.rows[i].datos.Mar).toFixed(2),
			Abr: parseFloat(registros.rows[i].datos.Abr).toFixed(2),
			May: parseFloat(registros.rows[i].datos.May).toFixed(2),
			Jun: parseFloat(registros.rows[i].datos.Jun).toFixed(2),
			Jul: parseFloat(registros.rows[i].datos.Jul).toFixed(2),
			Ago: parseFloat(registros.rows[i].datos.Ago).toFixed(2),
			Sep: parseFloat(registros.rows[i].datos.Sep).toFixed(2),
			Oct: parseFloat(registros.rows[i].datos.Oct).toFixed(2),
			Nov: parseFloat(registros.rows[i].datos.Nov).toFixed(2),
			Dic: parseFloat(registros.rows[i].datos.Dic).toFixed(2),
			Idx: registros.rows[i].idx,
			Response: registros.rows[i].response,
			Nivel: registros.rows[i].nivel,
			Clave: registros.rows[i].clave,
			Indice: registros.rows[i].datos.Indice,
		});
		dato = {};
	}
	logger.timeEnd("Log: Get Datos Total");
	res.json(regs);
});
// Leemos un registro de totales y sus pesos por cia. Siempres de la version original
routes.get("/leototalobjetivo/:idlayout", async (req, res) => {
	logger.log(new Date().toLocaleString(), "#Total Objetivos ...: ");
	var regs = [];
	var regpadre = await objutilsSql.leerpadre(req.params.idlayout);
	// Registros de el presupuesto Original. Para no perder referencia de valores anteriores
	var tregistros = await objutilsSql.leerfilaoriginal(regpadre.id, 1);
	// SI no hay registros
	if (tregistros.rowCount) {
		regs.push({
			Descripcion: "Total Anterior " + tregistros.rows[0].literal,
			Tot: parseFloat(tregistros.rows[0].datos.Tot),
			Ene: parseFloat(tregistros.rows[0].datos.Ene),
			Feb: parseFloat(tregistros.rows[0].datos.Feb),
			Mar: parseFloat(tregistros.rows[0].datos.Mar),
			Abr: parseFloat(tregistros.rows[0].datos.Abr),
			May: parseFloat(tregistros.rows[0].datos.May),
			Jun: parseFloat(tregistros.rows[0].datos.Jun),
			Jul: parseFloat(tregistros.rows[0].datos.Jul),
			Ago: parseFloat(tregistros.rows[0].datos.Ago),
			Sep: parseFloat(tregistros.rows[0].datos.Sep),
			Oct: parseFloat(tregistros.rows[0].datos.Oct),
			Nov: parseFloat(tregistros.rows[0].datos.Nov),
			Dic: parseFloat(tregistros.rows[0].datos.Dic),
			Idx: 1,
			Response: tregistros.rows[0].response,
			Nivel: tregistros.rows[0].nivel,
		});

		regs.push({
			Descripcion: "Pesos Anterior Cia % ... ",
			Tot: parseFloat(100.0),
			Ene:
				(parseFloat(tregistros.rows[0].datos.Ene) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Feb:
				(parseFloat(tregistros.rows[0].datos.Feb) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Mar:
				(parseFloat(tregistros.rows[0].datos.Mar) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Abr:
				(parseFloat(tregistros.rows[0].datos.Abr) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			May:
				(parseFloat(tregistros.rows[0].datos.May) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Jun:
				(parseFloat(tregistros.rows[0].datos.Jun) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Jul:
				(parseFloat(tregistros.rows[0].datos.Jul) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Ago:
				(parseFloat(tregistros.rows[0].datos.Ago) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Sep:
				(parseFloat(tregistros.rows[0].datos.Sep) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Oct:
				(parseFloat(tregistros.rows[0].datos.Oct) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Nov:
				(parseFloat(tregistros.rows[0].datos.Nov) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Dic:
				(parseFloat(tregistros.rows[0].datos.Dic) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Idx: 2,
			Response: tregistros.rows[0].response,
			Nivel: tregistros.rows[0].nivel,
		});
		//Leemos los datos de la nueva versión.
		var nregistros = await objutilsSql.leerfilaoriginal(
			req.params.idlayout,
			1
		);
		regs.push({
			Descripcion: "Total Nuevo " + tregistros.rows[0].literal,
			Tot: parseFloat(nregistros.rows[0].datos.Tot),
			Ene: parseFloat(nregistros.rows[0].datos.Ene),
			Feb: parseFloat(nregistros.rows[0].datos.Feb),
			Mar: parseFloat(nregistros.rows[0].datos.Mar),
			Abr: parseFloat(nregistros.rows[0].datos.Abr),
			May: parseFloat(nregistros.rows[0].datos.May),
			Jun: parseFloat(nregistros.rows[0].datos.Jun),
			Jul: parseFloat(nregistros.rows[0].datos.Jul),
			Ago: parseFloat(nregistros.rows[0].datos.Ago),
			Sep: parseFloat(nregistros.rows[0].datos.Sep),
			Oct: parseFloat(nregistros.rows[0].datos.Oct),
			Nov: parseFloat(nregistros.rows[0].datos.Nov),
			Dic: parseFloat(nregistros.rows[0].datos.Dic),
			Idx: 3,
			Response: nregistros.rows[0].response,
			Nivel: nregistros.rows[0].nivel,
		});

		regs.push({
			Descripcion: "Pesos Nuevo Cia % ... ",
			Tot: parseFloat(100.0),
			Ene:
				(parseFloat(nregistros.rows[0].datos.Ene) /
					parseFloat(nregistros.rows[0].datos.Tot)) *
				100,
			Feb:
				(parseFloat(nregistros.rows[0].datos.Feb) /
					parseFloat(nregistros.rows[0].datos.Tot)) *
				100,
			Mar:
				(parseFloat(nregistros.rows[0].datos.Mar) /
					parseFloat(nregistros.rows[0].datos.Tot)) *
				100,
			Abr:
				(parseFloat(nregistros.rows[0].datos.Abr) /
					parseFloat(nregistros.rows[0].datos.Tot)) *
				100,
			May:
				(parseFloat(nregistros.rows[0].datos.May) /
					parseFloat(nregistros.rows[0].datos.Tot)) *
				100,
			Jun:
				(parseFloat(nregistros.rows[0].datos.Jun) /
					parseFloat(nregistros.rows[0].datos.Tot)) *
				100,
			Jul:
				(parseFloat(nregistros.rows[0].datos.Jul) /
					parseFloat(nregistros.rows[0].datos.Tot)) *
				100,
			Ago:
				(parseFloat(nregistros.rows[0].datos.Ago) /
					parseFloat(nregistros.rows[0].datos.Tot)) *
				100,
			Sep:
				(parseFloat(nregistros.rows[0].datos.Sep) /
					parseFloat(nregistros.rows[0].datos.Tot)) *
				100,
			Oct:
				(parseFloat(nregistros.rows[0].datos.Oct) /
					parseFloat(nregistros.rows[0].datos.Tot)) *
				100,
			Nov:
				(parseFloat(nregistros.rows[0].datos.Nov) /
					parseFloat(nregistros.rows[0].datos.Tot)) *
				100,
			Dic:
				(parseFloat(nregistros.rows[0].datos.Dic) /
					parseFloat(nregistros.rows[0].datos.Tot)) *
				100,
			Idx: 4,
			Response: nregistros.rows[0].response,
			Nivel: nregistros.rows[0].nivel,
		});
		regs.push({
			Descripcion: "% Vs Pto Original... ",
			Tot:
				(parseFloat(nregistros.rows[0].datos.Tot) /
					parseFloat(tregistros.rows[0].datos.Tot) -
					1) *
				100,
			Ene:
				(parseFloat(nregistros.rows[0].datos.Ene) /
					parseFloat(tregistros.rows[0].datos.Ene) -
					1) *
				100,
			Feb:
				(parseFloat(nregistros.rows[0].datos.Feb) /
					parseFloat(tregistros.rows[0].datos.Feb) -
					1) *
				100,
			Mar:
				(parseFloat(nregistros.rows[0].datos.Mar) /
					parseFloat(tregistros.rows[0].datos.Mar) -
					1) *
				100,
			Abr:
				(parseFloat(nregistros.rows[0].datos.Abr) /
					parseFloat(tregistros.rows[0].datos.Abr) -
					1) *
				100,
			May:
				(parseFloat(nregistros.rows[0].datos.May) /
					parseFloat(tregistros.rows[0].datos.May) -
					1) *
				100,
			Jun:
				(parseFloat(nregistros.rows[0].datos.Jun) /
					parseFloat(tregistros.rows[0].datos.Jun) -
					1) *
				100,
			Jul:
				(parseFloat(nregistros.rows[0].datos.Jul) /
					parseFloat(tregistros.rows[0].datos.Jul) -
					1) *
				100,
			Ago:
				(parseFloat(nregistros.rows[0].datos.Ago) /
					parseFloat(tregistros.rows[0].datos.Ago) -
					1) *
				100,
			Sep:
				(parseFloat(nregistros.rows[0].datos.Sep) /
					parseFloat(tregistros.rows[0].datos.Sep) -
					1) *
				100,
			Oct:
				(parseFloat(nregistros.rows[0].datos.Oct) /
					parseFloat(tregistros.rows[0].datos.Oct) -
					1) *
				100,
			Nov:
				(parseFloat(nregistros.rows[0].datos.Nov) /
					parseFloat(tregistros.rows[0].datos.Nov) -
					1) *
				100,
			Dic:
				(parseFloat(nregistros.rows[0].datos.Dic) /
					parseFloat(tregistros.rows[0].datos.Dic) -
					1) *
				100,
			Idx: 5,
			Response: nregistros.rows[0].response,
			Nivel: nregistros.rows[0].nivel,
		});
	}
	res.send(regs);
});
// Leemos un registro de datos
routes.get("/leounobjetivoinicial/:idlayout/:id", async (req, res) => {
	var tregistros = "";
	logger.log(new Date().toLocaleString(), "#Lista Total Ventas Nuevos...: ");
	var empresa_session = await utilidades.leerempresasession(req.sessionID);
	EMPRESA = await objutilsSql.leerempresa(empresa_session);
	var regpadre = await objutilsSql.leerpadre(req.params.idlayout);
	tregistros = await objutilsSql.leerfilaoriginal(
		regpadre.id,
		parseInt(req.params.id)
	);

	var regs = [];
	if (tregistros.rowCount) {
		regs.push({
			Descripcion: "Valor Inicial " + tregistros.rows[0].literal,
			Tot: parseFloat(tregistros.rows[0].datos.Tot),
			Ene: parseFloat(tregistros.rows[0].datos.Ene),
			Feb: parseFloat(tregistros.rows[0].datos.Feb),
			Mar: parseFloat(tregistros.rows[0].datos.Mar),
			Abr: parseFloat(tregistros.rows[0].datos.Abr),
			May: parseFloat(tregistros.rows[0].datos.May),
			Jun: parseFloat(tregistros.rows[0].datos.Jun),
			Jul: parseFloat(tregistros.rows[0].datos.Jul),
			Ago: parseFloat(tregistros.rows[0].datos.Ago),
			Sep: parseFloat(tregistros.rows[0].datos.Sep),
			Oct: parseFloat(tregistros.rows[0].datos.Oct),
			Nov: parseFloat(tregistros.rows[0].datos.Nov),
			Dic: parseFloat(tregistros.rows[0].datos.Dic),
			Idx: 1,
			Response: tregistros.rows[0].response,
			Nivel: tregistros.rows[0].nivel,
		});
		regs.push({
			Descripcion: "Diferencia " + registros.rows[0].literal,
			Tot: parseFloat(0.0),
			Ene: parseFloat(0.0),
			Feb: parseFloat(0.0),
			Mar: parseFloat(0.0),
			Abr: parseFloat(0.0),
			May: parseFloat(0.0),
			Jun: parseFloat(0.0),
			Jul: parseFloat(0.0),
			Ago: parseFloat(0.0),
			Sep: parseFloat(0.0),
			Oct: parseFloat(0.0),
			Nov: parseFloat(0.0),
			Dic: parseFloat(0.0),
			Idx: 2,
			Response: tregistros.rows[0].response,
			Nivel: tregistros.rows[0].nivel,
		});
		regs.push({
			Descripcion: "Pesos % ...",
			Tot: parseFloat(0.0),
			Ene: parseFloat(0.0),
			Feb: parseFloat(0.0),
			Mar: parseFloat(0.0),
			Abr: parseFloat(0.0),
			May: parseFloat(0.0),
			Jun: parseFloat(0.0),
			Jul: parseFloat(0.0),
			Ago: parseFloat(0.0),
			Sep: parseFloat(0.0),
			Oct: parseFloat(0.0),
			Nov: parseFloat(0.0),
			Dic: parseFloat(0.0),
			Idx: 3,
			Response: tregistros.rows[0].response,
			Nivel: tregistros.rows[0].nivel,
		});
		regs.push({
			Descripcion: "Pesos % ...",
			Tot: parseFloat(100.0),
			Ene:
				(parseFloat(tregistros.rows[0].datos.Ene) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Feb:
				(parseFloat(tregistros.rows[0].datos.Feb) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Mar:
				(parseFloat(tregistros.rows[0].datos.Mar) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Abr:
				(parseFloat(tregistros.rows[0].datos.Abr) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			May:
				(parseFloat(tregistros.rows[0].datos.May) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Jun:
				(parseFloat(tregistros.rows[0].datos.Jun) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Jul:
				(parseFloat(tregistros.rows[0].datos.Jul) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Ago:
				(parseFloat(tregistros.rows[0].datos.Ago) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Sep:
				(parseFloat(tregistros.rows[0].datos.Sep) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Oct:
				(parseFloat(tregistros.rows[0].datos.Oct) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Nov:
				(parseFloat(tregistros.rows[0].datos.Nov) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Dic:
				(parseFloat(tregistros.rows[0].datos.Dic) /
					parseFloat(tregistros.rows[0].datos.Tot)) *
				100,
			Idx: 4,
			Response: tregistros.rows[0].response,
			Nivel: tregistros.rows[0].nivel,
		});
		regs.push({
			Descripcion: "Descuadre de Reparto ",
			Tot: parseFloat(0.0),
			Ene: parseFloat(0.0),
			Feb: parseFloat(0.0),
			Mar: parseFloat(0.0),
			Abr: parseFloat(0.0),
			May: parseFloat(0.0),
			Jun: parseFloat(0.0),
			Jul: parseFloat(0.0),
			Ago: parseFloat(0.0),
			Sep: parseFloat(0.0),
			Oct: parseFloat(0.0),
			Nov: parseFloat(0.0),
			Dic: parseFloat(0.0),
			Idx: 5,
			Response: tregistros.rows[0].response,
			Nivel: tregistros.rows[0].nivel,
		});
	}
	res.send(regs);
});
//
// });
routes.get("/leerlayout", async (req, res) => {
	logger.log(
		new Date().toLocaleString(),
		"# Log: leerlayouts",
		req.session.idempresa
	);
	var empresa_session = await utilidades.leerempresasession(req.sessionID);
	EMPRESA = await objutilsSql.leerempresa(empresa_session);
	var regs = await objutilsSql.leerlayout(empresa_session);
	var linlay = {};
	var layoutid = "";
	for (var i = 0; i < regs.length; i++) {
		if (regs[i].version === "VP") {
			linlay = await objutilsSql.leerlinlay("R", regs[i].id);
		} else {
			linlay = await objutilsSql.leerlinlay("R", regs[i].response);
		}
		regs[i].campo_resumen = linlay.descripcion;
	}
	res.send(regs);
});

// Leemos un registro de totales para su presentacion
routes.get("/leerlayoutgrafico", async (req, res) => {
	var tregistros = "";
	logger.log(
		new Date().toLocaleString(),
		"# Estamos en leerlayoutgrafico ... "
	);
	var empresa_session = await utilidades.leerempresasession(req.sessionID);
	EMPRESA = await objutilsSql.leerempresa(empresa_session);
	//var regpadre = await objutilsSql.leerpadre(req.query.layout_id);
	tregistros = await objutilsSql.leerfilaoriginal(req.query.layout_id, 1);
	var regs = [];
	if (tregistros.rowCount > 0) {
		regs.push(
			{
				Mes: "Tot",
				Valor: parseFloat(tregistros.rows[0].datos.Tot).toFixed(2),
			},
			{
				Mes: "Ene",
				Valor: parseFloat(tregistros.rows[0].datos.Ene).toFixed(2),
			},
			{
				Mes: "Feb",
				Valor: parseFloat(tregistros.rows[0].datos.Feb).toFixed(2),
			},
			{
				Mes: "Mar",
				Valor: parseFloat(tregistros.rows[0].datos.Mar).toFixed(2),
			},
			{
				Mes: "Abr",
				Valor: parseFloat(tregistros.rows[0].datos.Abr).toFixed(2),
			},
			{
				Mes: "May",
				Valor: parseFloat(tregistros.rows[0].datos.May).toFixed(2),
			},
			{
				Mes: "Jun",
				Valor: parseFloat(tregistros.rows[0].datos.Jun).toFixed(2),
			},
			{
				Mes: "Jul",
				Valor: parseFloat(tregistros.rows[0].datos.Jul).toFixed(2),
			},
			{
				Mes: "Ago",
				Valor: parseFloat(tregistros.rows[0].datos.Ago).toFixed(2),
			},
			{
				Mes: "Sep",
				Valor: parseFloat(tregistros.rows[0].datos.Sep).toFixed(2),
			},
			{
				Mes: "Oct",
				Valor: parseFloat(tregistros.rows[0].datos.Oct).toFixed(2),
			},
			{
				Mes: "Nov",
				Valor: parseFloat(tregistros.rows[0].datos.Nov).toFixed(2),
			},
			{
				Mes: "Dic",
				Valor: parseFloat(tregistros.rows[0].datos.Dic).toFixed(2),
			}
		);
	} else {
		regs.push({
			Mes: "Tot",
			Valor: parseFloat(0.0),
		});
	}
	res.send(regs);
});
routes.get("/leerlayoutgraficopie", async (req, res) => {
	var tregistros = "";
	logger.log(new Date().toLocaleString(), "#Total Objetivos ...: ");

	//var regpadre = await objutilsSql.leerpadre(req.query.layout_id);

	tregistros = await objutilsSql.leerfilaoriginal(req.query.layout_id, 1);
	var regs = [];
	if (tregistros.rowCount > 0) {
		regs.push(
			{
				Mes: "Ene",
				Valor:
					(parseFloat(tregistros.rows[0].datos.Ene).toFixed(2) /
						parseFloat(tregistros.rows[0].datos.Tot).toFixed(2)) *
					100,
			},
			{
				Mes: "Feb",
				Valor:
					(parseFloat(tregistros.rows[0].datos.Feb).toFixed(2) /
						parseFloat(tregistros.rows[0].datos.Tot).toFixed(2)) *
					100,
			},
			{
				Mes: "Mar",
				Valor:
					(parseFloat(tregistros.rows[0].datos.Mar).toFixed(2) /
						parseFloat(tregistros.rows[0].datos.Tot).toFixed(2)) *
					100,
			},
			{
				Mes: "Abr",
				Valor:
					(parseFloat(tregistros.rows[0].datos.Abr).toFixed(2) /
						parseFloat(tregistros.rows[0].datos.Tot).toFixed(2)) *
					100,
			},
			{
				Mes: "May",
				Valor:
					(parseFloat(tregistros.rows[0].datos.May).toFixed(2) /
						parseFloat(tregistros.rows[0].datos.Tot).toFixed(2)) *
					100,
			},
			{
				Mes: "Jun",
				Valor:
					(parseFloat(tregistros.rows[0].datos.Jun).toFixed(2) /
						parseFloat(tregistros.rows[0].datos.Tot).toFixed(2)) *
					100,
			},
			{
				Mes: "Jul",
				Valor:
					(parseFloat(tregistros.rows[0].datos.Jul).toFixed(2) /
						parseFloat(tregistros.rows[0].datos.Tot).toFixed(2)) *
					100,
			},
			{
				Mes: "Ago",
				Valor:
					(parseFloat(tregistros.rows[0].datos.Ago).toFixed(2) /
						parseFloat(tregistros.rows[0].datos.Tot).toFixed(2)) *
					100,
			},
			{
				Mes: "Sep",
				Valor:
					(parseFloat(tregistros.rows[0].datos.Sep).toFixed(2) /
						parseFloat(tregistros.rows[0].datos.Tot).toFixed(2)) *
					100,
			},
			{
				Mes: "Oct",
				Valor:
					(parseFloat(tregistros.rows[0].datos.Oct).toFixed(2) /
						parseFloat(tregistros.rows[0].datos.Tot).toFixed(2)) *
					100,
			},
			{
				Mes: "Nov",
				Valor:
					(parseFloat(tregistros.rows[0].datos.Nov).toFixed(2) /
						parseFloat(tregistros.rows[0].datos.Tot).toFixed(2)) *
					100,
			},
			{
				Mes: "Dic",
				Valor:
					(parseFloat(tregistros.rows[0].datos.Dic).toFixed(2) /
						parseFloat(tregistros.rows[0].datos.Tot).toFixed(2)) *
					100,
			}
		);
	}
	res.send(regs);
});
// Tabla de Pareto para un Layout y Nivel concreto
routes.get("/pareto", async (req, res) => {
	var regpadre = await objutilsSql.leerpadre(req.query.layout_id);
	logger.log(
		new Date().toLocaleString(),
		"# /Calculamos Pareto",
		req.query.layout_id,
		req.query.nivel_id
	);
	var reg = await objutilsSql.pareto(
		regpadre.id,
		req.query.nivel_id,
		req.query.version
	);
	if (reg.length > 0) {
		res.json(reg);
	}
});
//Calculo de Distribucion por Grupos
routes.get("/distribucion", async (req, res, next) => {
	var empresa_session = await utilidades.leerempresasession(req.sessionID);

	var regpadre = await objutilsSql.leerpadre(req.query.layout_id);
	if (req.query.nivel_id != "") {
		try {
			logger.log(
				" /distribucion",
				EMPRESA.id,
				req.query.layout_id,
				req.query.nivel_id
			);
			var pyshell = new PythonShell("./src/routes/distribucion.py", {
				args: [
					empresa_session,
					regpadre.id,
					req.query.nivel_id,
					req.query.version,
				],
			});
			var data = "";
			var regs = [];
			pyshell.on("message", function (message) {
				// Recibimos la nueva Matriz desde Python y guardamos cada entrada en un String
				data += message;
			});
			// Fin de la recogida de la Matriz y parseamos el String con la Matriz final
			pyshell.end(function (err) {
				if (err) {
					next(err);
				}
				if (data) {
					var datos = JSON.parse(data);
					for (var i = 0; i < datos.length; i++) {
						if (datos[i].FreqRel != 0) {
							var limiteInf = Intl.NumberFormat("es-512").format(
								datos[i].LimInf.toFixed(2)
							);
							var limiteSup = Intl.NumberFormat("es-512").format(
								datos[i].LimSup.toFixed(2)
							);
							regs.push({
								FreqRel: datos[i].FreqRel.toFixed(2),
								FreqAbs: datos[i].FreqAbs.toFixed(0),
								Intervalo:
									"de " + limiteInf + " a " + limiteSup,
								LimInf: datos[i].LimInf,
								LimSup: datos[i].LimSup,
							});
						}
					}
					res.send(regs);
				}
			});
		} catch (error) {
			res.json("");
			next(error);
		}
	} else {
		res.json("");
	}
});

//-------------------------------------------------------
// Recogemos los datos de la  Tabla de Objetivos por Ajax (EJS listadoAjax)
// Guardamos en BBDD y llamamos al reparto de la tabla del nivel correspondiente TODO
//------------------------------------------------------

routes.post("/recibeAjax", async (req, res, next) => {
	const client = await db.getClient();
	let layout_id = req.query.uno;
	console.time("/recibeAjax...", layout_id);
	//Recogemos filas del Array de Objetivosa. Como String
	let pp = req.body;
	let fila = pp[0][1];
	let version = fila.version;
	let versionanterior = fila.versionanterior;
	let observaciones = fila.observaciones;

	(async () => {
		try {
			await client.query("BEGIN");
			var idusuario = await utilidades.leerusuariosesion(req.sessionID);
			//Leemos el ID Padre de cab_layout para utilizar en el response

			querystring =
				"SELECT id, codigo, version, descripcion, esquemas_cab_id, observaciones, fechaoperacion, fechaalta, userid, version, response FROM esquemas_layout_cab c WHERE c.id = $1 AND c.version = $2;";
			var lcab = await client.query(querystring, [layout_id, version]);

			//logger.log(version,JSON.stringify(obj));
			if (lcab.rowCount > 0) {
				// Actualizamos Version
				let pk = null;
				let datos = null;
				querystring =
					"UPDATE esquemas_layout_cab d SET userid = $1, fechaoperacion = $2, observaciones = $3  WHERE id = $4 RETURNING id;";
				let reg = await client.query(querystring, [
					idusuario,
					"now()",
					observaciones,
					lcab.rows[0].id,
				]);
				for (i = 1; i < pp.length; i++) {
					fila = pp[i][1];
					pk = parseInt(fila.Pk);
					datos = JSON.stringify(pp[i][1]);
					querystring =
						'UPDATE esquemas_data_lin d SET "datos" = $1,userid = $2, fechaoperacion = $3 WHERE id = $4 RETURNING id;';
					reg = await client.query(querystring, [
						datos,
						idusuario,
						"now()",
						pk,
					]);
					logger.log("Actualizamos Valores ......", pk);
				}
			} else {
				// Insertamos nueva version. Leemos el padre de la nueva version
				//1. Localizamos el registro padre (response)
				//2. Borramos Lineas y Cabeceras por response
				querystring =
					"SELECT COALESCE (response, id ) as id , codigo, version, descripcion, esquemas_cab_id, observaciones FROM esquemas_layout_cab c WHERE c.id  = $1 ;";
				var idpadre = await client.query(querystring, [layout_id]);

				querystring =
					"DELETE FROM esquemas_data_lin dl WHERE dl.esquema_lin_lay_id in " +
					"(select l.id  FROM esquemas_layout_lin l, esquemas_layout_cab c WHERE l.esquema_cab_lay_id = c.id AND c.id = $1) " +
					"AND dl.version = $2;";
				let regdelete = await client.query(querystring, [
					idpadre.rows[0].id,
					version,
				]);
				querystring =
					"DELETE FROM esquemas_layout_cab c WHERE   c.response = $1 AND c.version = $2;";
				regdelete = await client.query(querystring, [
					idpadre.rows[0].id,
					version,
				]);

				logger.log("Insertamos Valores ......");
				//Insertamos esquema cabeceras con el padre (response) Version 'VP'
				querystring =
					"INSERT INTO esquemas_layout_cab(codigo, descripcion, esquemas_cab_id, observaciones, fechaoperacion, fechaalta, userid, version, response) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)  RETURNING id";
				var lreg = await client.query(querystring, [
					idpadre.rows[0].codigo,
					idpadre.rows[0].descripcion,
					idpadre.rows[0].esquemas_cab_id,
					observaciones,
					"now()",
					"now()",
					idusuario,
					version,
					idpadre.rows[0].id,
				]);
				//Insertamos datos de lineas
				for (i = 1; i < pp.length; i++) {
					fila = pp[i][1];
					pk = parseInt(fila.Pk);
					datos = JSON.stringify(pp[i][1]);
					querystring =
						"INSERT INTO esquemas_data_lin(esquema_lin_lay_id, version, clave, descripcion, nivel, idx, literal, response, datos, userid, fechaoperacion) ";
					querystring +=
						"SELECT	 esquema_lin_lay_id, $1, clave, descripcion, nivel, idx, literal,  ";
					querystring +=
						"response, $2, $3, $4  FROM esquemas_data_lin WHERE id = $5 AND version = $6;";
					reg = await client.query(querystring, [
						version,
						datos,
						idusuario,
						"now()",
						pk,
						versionanterior,
					]);
				}
			}
			console.timeEnd("/recibeAjax...", layout_id);
			await client.query("COMMIT");
			res.json("Ok");
		} catch (error) {
			await client.query("ROLLBACK");
			logger.error(new Date().toLocaleString(), error.message);
			res.json(error.message);
		} finally {
			client.release();
		}
	})();
});
//---------------------------------------------------
// Descarga Fichero CSV. Posteriormente se convierte en FIchero XLSX
//--------------------------------------------------
routes.post("/descargafile/:id", async (req, res, next) => {
	try {
		logger.time("/descargafile...", req.params.id);
		var pp = req.body;
		(async () => {
			try {
				var tocsv = [];
				for (i = 0; i < pp.length; i++) {
					//var obj = JSON.parse(pp[i][1]);
					tocsv.push(pp[i][1]);
				}
				logger.time("/exportExcel...");

				var t = new Date().getTime();
				var options = { delimiter: { field: ";" } };
				const csv = await converter.json2csvAsync(tocsv, options);
				//const csves = csv.replaceAll('.',',');
				// write CSV to a file
				w_fichero =
					EMPRESA.idcodigo +
					"_Data_Agrupado_" +
					t.toString() +
					".xlsx";
				camino = EMPRESA.ruta + w_fichero;
				fs.writeFileSync(camino, csv, "utf8");
				req.session.fichero = w_fichero;
				logger.timeEnd("/exportExcel...");
				res.json("Ok");
				logger.timeEnd("/descargafile...");
			} catch (error) {
				console.log(error);
				next(error);
			}
		})();
	} catch (error) {
		next(error);
	}
});

//El Usuario cambia de Empresa en combo de header y redirigimos a portada
routes.get("/cambioempresa/:id", async (req, res) => {
	logger.log(
		new Date().toLocaleString() + "#Cambio Empresa " + " a " + req.params.id
	);
	var idempresa = await utilidades.cambioempresasession(
		req.sessionID,
		req.params.id
	);
	res.json(req.rawHeaders[21]);
	//res.redirect('/objetivos/listalayouts');
});
// //---------------------------------------------------
// // Descargamos el Excel Guardado Previamente en Formato CSV
// //--------------------------------------------------
routes.get("/descargaexcel", async (req, res) => {
	w_fichero = req.session.fichero;
	camino = EMPRESA.ruta + w_fichero;
	logger.log(new Date().toLocaleString(), "#Descarga Excel : " + camino);
	await excel.exportExcelLayouts(res, camino);
});
//////////////////////////////////////////////////////////////////////
// Entradas de Prueba y Demos de Componentes y Otras Cosas          //
//////////////////////////////////////////////////////////////////////
routes.get("/demos", async (req, res) => {
	logger.log(new Date().toLocaleString(), "#Demos  ......");
	res.render("portada", { title: "Menu Lateral", layout: "./layouts/kkkk" });
});
routes.post("/demos", async (req, res) => {
	logger.log(new Date().toLocaleString(), "#Log: demos");
	const client = await db.getClient();
	var regs = [];
	// LEEMOS LOS DATOS
	sqlstring = "SELECT ";
	sqlstring += "dl.literal as clave,";
	sqlstring += "SUM((dl.datos ->> 'Tot')::float) as Tot,";
	sqlstring += "SUM((dl.datos ->> 'Ene')::float) as Mes1,";
	sqlstring += "SUM((dl.datos ->> 'Feb')::float) as Mes2,";
	sqlstring += "SUM((dl.datos ->> 'Mar')::float) as Mes3,";
	sqlstring += "SUM((dl.datos ->> 'Abr')::float) as Mes4,";
	sqlstring += "SUM((dl.datos ->> 'May')::float) as Mes5,";
	sqlstring += "SUM((dl.datos ->> 'Jun')::float) as Mes6,";
	sqlstring += "SUM((dl.datos ->> 'Jul')::float) as Mes7,";
	sqlstring += "SUM((dl.datos ->> 'Ago')::float) as Mes8,";
	sqlstring += "SUM((dl.datos ->> 'Sep')::float) as Mes9,";
	sqlstring += "SUM((dl.datos ->> 'Oct')::float) as Mes10,";
	sqlstring += "SUM((dl.datos ->> 'Nov')::float) as Mes11,";
	sqlstring += "SUM((dl.datos ->> 'Dic')::float) as Mes12 ";
	sqlstring += "FROM esquemas_layout_lin l, esquemas_data_lin dl ";
	sqlstring += " WHERE  l.fila_col ='F' ";
	sqlstring += " AND l.esquema_cab_lay_id = $1 ";
	sqlstring +=
		" AND l.id = dl.esquema_lin_lay_id AND  l.id = dl.esquema_lin_lay_id ";
	sqlstring += " AND dl.nivel = $2  GROUP BY dl.literal ORDER by dl.literal ";
	await client
		.query(sqlstring, [req.body.layout_id, req.body.nivel_id])
		.then((data) => {
			for (var i = 0; i < data.rowCount; i++) {
				//var temp = [];
				//temp = data.rows[i].clave.split('$');
				regs.push({
					Clave: data.rows[i].clave,
					Objetivo: parseFloat(data.rows[i].tot),
				});
			}
			client.release();
			res.send(regs);
		})
		.catch((error) => {
			console.log("Error: " + error.message);
			res.render("error", { merror: error.message });
		});
});
routes.get("/pintargrafico", async (req, res) => {
	logger.log(new Date().toLocaleString(), "#/pintargrafico  ......");
	res.render("grafobjetivos");
});

function cleanInt(x) {
	x = Number(x);
	return x >= 0 ? Math.floor(x) : Math.ceil(x);
}
function queTipo(mitipo) {
	switch (mitipo) {
		case "Número":
			return 0;
		case "Texto":
			return 1;
		case "Fecha":
			return 2;
	}
}
function es_numero(mivalor) {
	// Si es un mumero JS Válido
	if (isNumber(mivalor)) {
		return mivalor;
	}

	// Si es un string con formato es_es
	if (mivalor.match(numero_es)) {
		// Limpiamos las comas
		mivalor = mivalor.replace(".", "");
		mivalor = mivalor.replace(",", ".");
		return mivalor;
	}
	// Si es un String o Fecha
	return null;
}
function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
async function leerExcel(res, w_fichero) {
	var workbook = new ExcelJS.Workbook();
	await workbook.xlsx.readFile(w_fichero);
	res.setHeader(
		"Content-Type",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	);
	res.setHeader("Content-Disposition", "attachment; filename=" + w_fichero);
	await workbook.xlsx.write(res);
	res.status(200).end();
}
var auth = function (req, res, next) {
	if (req.session && req.session.user === "jose" && req.session.admin)
		return next();
	else return res.sendStatus(401);
};
// Revisa el  Array por si hay nulos
const haynulos = (elemento) => elemento === null || elemento === "";
// Nuevo formateador para puntos decenas de miles miles Español
(function () {
	// Obtenemos la definicion de la funcion original
	let prop = Object.getOwnPropertyDescriptor(
		Intl.NumberFormat.prototype,
		"format"
	);

	// Sobrescribimos el método "format"
	Object.defineProperty(Intl.NumberFormat.prototype, "format", {
		get: function () {
			return function (value) {
				let fn = prop.get.call(this), // Recuperamos la funcion "formateadora" original
					opts = this.resolvedOptions(); // Obtenemos las opciones de "formateo"
				// Solo cambiamos el formateo cuando es moneda en español y el numero es >= 1.000 o menor a 10.000
				if (
					opts.style === "decimal" &&
					opts.locale.substr(0, 2) === "es" &&
					opts.numberingSystem === "latn" &&
					value >= 1000 &&
					value < 10000
				) {
					let num = fn(10000), // -> [pre]10[sep]000[sub]
						pre = num.substr(0, num.indexOf("10")),
						sep = num.substr(num.indexOf("10") + 2, 1),
						sub = num.substr(num.indexOf("000") + 3);
					num = value.toString();
					return (
						pre +
						num.slice(0, 1) +
						sep +
						num.slice(1).replace(".", ",") +
						sub
					);
				}
				// Sino devolvemos el número formateado normalmente
				return fn(value);
			};
		},
	});
})();
module.exports = routes;
