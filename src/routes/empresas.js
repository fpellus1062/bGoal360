const express = require("express");
//const session = require('express-session');
const routes = express.Router();
const fs = require("fs");
const path = require("path");
//const console = require('console');
const { Console } = require("node:console");
const { Pool } = require("pg");
const db = require("../db/index.cjs");
const utilidades = require("../modulos/utilidades");

////////////////////////////////////////////////////
// DEFINICIONES GLOBALES Y DECLARACIONES
///////////////////////////////////////////////////.
const output = fs.createWriteStream(path.join(__dirname, "../console.log"));
const errorOutput = fs.createWriteStream(path.join(__dirname, "../error.log"));
// Custom simple logger
const logger = new Console({ stdout: output, stderr: errorOutput });
// const pool = new Pool();
// // Router para peticiones asincronas
// pool.on('error', (err, client) => {
//   logger.error('Unexpected error on idle client', err);
//   process.exit(-1);
// });
logger.log(new Date().toLocaleString(), "#Estoy en el ROUTER EMPRESAS -------");

// Autorizacion Total
// routes.use('/', function(req, res, next){
//   if(!req.session.usuario){
//     res.render('error_login', { leereror: 'No tiene Autorizacion', layout: './layouts/full-width'});
//   }else{
//     next(); // si está logueado continúa la ejecución de los siguientes get
//   }
// });

// Peticion GET para mostrar el listado de empresas
routes.get("/empresaslistado", async (req, res) => {
	res.render("listaempresasconfig", {
		title: "Configuracion de Empresas",
		layout: "./layouts/sidebar",
	});
});

// Metodo POST para recoger los datos del formualario de Alta de Empresas
routes.put("/empresasalta", async function (req, res, next) {
	var idusuario = await utilidades.leerusuariosesion(req.sessionID);
	var querystring =
		"INSERT INTO empresas_config (empresa_id,nombre,ejercicio_inicio,ejercicio_fin,ejercicio_descripcion,path,usercreate,userupdate,datealta,dateactualizacion,datebaja,userid) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id";
	await db
		.query(querystring, [
			req.body.empresa_id,
			req.body.nombre,
			null,
			null,
			null,
			req.body.path,
			idusuario,
			idusuario,
			"now()",
			"now()",
			null,
			idusuario,
		])
		.then((data) => {
			logger.log(
				new Date().toLocaleString(),
				"#Insert Nueva Empresa Ok!: " + data.rows[0].id
			);
			res.json(data.rows[0].id);
		})
		.catch((error) => {
			logger.error("Error: " + error.message);
			res.json({ id: error.detail });
		});
});

// Peticion AJAX de Grid para listado de empresas
routes.post("/listaempresasconfig", async (req, res) => {
	var sqlstring =
		"SELECT id,empresa_id, nombre, ejercicio_inicio, ejercicio_fin, ejercicio_descripcion, path, usercreate, userupdate, datealta, dateactualizacion,datebaja ";
	sqlstring += "FROM empresas_config ORDER by id;";
	await db
		.query(sqlstring)
		.then((data) => {
			//client.release();
			res.json(data.rows);
		})
		.catch((error) => {
			logger.error(new Date().toLocaleString(), error);
		});
});

routes.put("/updateempresaconfig", async (req, res) => {
	var newvalor = req.body.newvalor;

	if (req.body.newvalor === undefined) {
		newvalor = req.body["newvalor[]"];
	}
	var reg = await updateempresaconfig(
		req.body.empresa_id,
		req.body.col,
		newvalor
	);
	if (reg == 1) {
		logger.log(new Date().toLocaleString(), "#Update Empresa", "Ok");
	} else {
		logger.error(new Date().toLocaleString(), "#Update Empresa", "Error");
	}
	res.json(reg);
});

routes.put("/deleteempresaconfig", async (req, res) => {
	var reg = await deleteempresaconfig(req.body.empresa_id, req.body.newvalor);
	if (reg == 1) {
		logger.log(
			new Date().toLocaleString(),
			"#Delete Empresa",
			req.body.empresa_id,
			"Ok"
		);
	} else {
		logger.error(
			new Date().toLocaleString(),
			"#Delete Empresa",
			req.body.empresa_id,
			"Error"
		);
	}
	res.json(reg);
});
// Borramos la empresa (Borrado Logico)
routes.get("/empresasborrar/:id", async function (req, res) {
	var querystring =
		"UPDATE empresas set (fechabaja,fechaactualizacion,motivobajaid) = ($1,$2) WHERE idempresa=$3;";
	await db
		.query(querystring, [
			"now()",
			"now()",
			req.body.motivobajaid,
			req.params.id,
		])
		.then((data) => {
			logger.log(
				new Date().toLocaleString(),
				"#Borrado Empresa: " + req.params.id
			);
			res.redirect("/empresas/empresaslistado");
		})
		.catch((error) => {
			logger.error(
				new Date().toLocaleString(),
				"#Error: " + error.message
			);
			res.render("empresas/empresasalta", {
				error: "Error al insertar en BBDD Tabla: empresas",
			});
		});
});
// Damos de alta (Logica) la Empresa
routes.post("/empresasdardealta/:id", async function (req, res) {
	var querystring =
		"UPDATE empresas set (fechabaja,motivobajaid,fechaactualizacion) = ($1,$2,$3) WHERE idempresa=$4;";
	await db
		.query(querystring, [null, null, "now()", req.params.id])
		.then((data) => {
			logger.log(
				new Date().toLocaleString(),
				"#Recupero  Empresa: " + req.params.id
			);
			res.redirect("/empresas/empresaslistado");
		})
		.catch((error) => {
			logger.error("Error: " + error.message);
			res.render("empresas/empresasmod", {
				error: "Error al insertar en BBDD Tabla: empresas",
			});
		});
});

// Peticion AJAX para ListBox Empresas de Usuario
routes.post("/usuariosempresas", async (req, res) => {
	logger.log(new Date().toLocaleString(), "#ID Session: " + req.sessionID);

	if (req.sessionID === null || req.sessionID === undefined) {
		res.redirect("/logout", { mensaje: "Tú sesión ha caducado." });
	}

	var usuario_session = await utilidades.leerusuariosesion(req.sessionID);
	var empresas_usuario = await utilidades.cargaempresasusuario(
		req,
		res,
		usuario_session
	);
	var empresa_session = await utilidades.leerempresasession(req.sessionID);
	if (!empresa_session || empresa_session === null) {
		res.render("/logout", { mensaje: "Tú sesión ha caducado." });
	}
	empresas_usuario.empresa_defecto = empresa_session;
	res.send(empresas_usuario);
});

async function updateempresaconfig(empresa_id, col, newvalor) {
	var result = 0;
	querystring =
		"UPDATE empresas_config  set " +
		col +
		"=$2,dateactualizacion = $3 WHERE id=$1";
	await db
		.query(querystring, [empresa_id, newvalor, "now()"])
		.then((data) => {
			result = data.rowCount;
			logger.log(
				new Date().toLocaleString(),
				"#Update  Empresa: " + req.params.id
			);
		})
		.catch((error) => {
			logger.error(
				new Date().toLocaleString(),
				"#Error: " + error.message
			);
		});
	//client.release();
	return result;
}
async function deleteempresaconfig(empresa_id, newvalor) {
	if (newvalor == "") {
		newvalor = "now()";
	} else {
		newvalor = null;
	}
	var result = 0;
	querystring =
		"UPDATE empresas_config  set datebaja = $2,dateactualizacion = $3 WHERE id=$1";
	await db
		.query(querystring, [empresa_id, newvalor, "now()"])
		.then((data) => {
			result = data.rowCount;
		})
		.catch((error) => {
			logger.error(
				new Date().toLocaleString(),
				"Error: " + error.message
			);
		});
	//client.release();
	return result;
}

module.exports = routes;
