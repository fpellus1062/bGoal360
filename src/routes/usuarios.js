const express = require("express");
//const session = require('express-session');
const router = express.Router();
const fs = require("fs");
const path = require("path");
//const console = require('console');
const { Console } = require("node:console");
const { Pool } = require("pg");
const db = require("../db/index.cjs");
const utilidades = require("../modulos/utilidades");
const mail = require("../modulos/mailto");

////////////////////////////////////////////////////
// DEFINICIONES GLOBALES Y DECLARACIONES
////////////////////////////////////////////////////

const output = fs.createWriteStream(path.join(__dirname, "../console.log"));
const errorOutput = fs.createWriteStream(path.join(__dirname, "../error.log"));
// Archivo Logs
const logger = new Console({ stdout: output, stderr: errorOutput });

logger.log(new Date().toLocaleString(), "#Estoy en el ROUTER USUARIOS -------");

//Autorizacion Total
// router.use('/', function(req, res, next){
//   if(!req.session.usuario){
//     res.render('error_login', { leererror: 'No tiene Autorizacion', layout: './layouts/full-width'});
//   }else{
//     next(); // si está logueado continúa la ejecución de los siguientes get
//   }
// });

// Peticion GET para mostrar el listado de usuarios
router.get("/usuarioslistado", async (req, res) => {
	logger.log(new Date().toLocaleString(), "#Render listadousuarios");

	res.render("listausuarios", {
		title: "Configuracion de usuarios",
		layout: "./layouts/sidebar",
	});
});

// Metodo POST para recoger los datos del formualario de Alta de Usuarios
router.put("/usuariosalta", async function (req, res, next) {
	var usuarioalta = {};
	usuarioalta = req.body;

	(async () => {
		const cadena = await utilidades.generateRandomString(6);
		let querystring = "SELECT crypt($1, gen_salt('bf', 10)) ";
		const client = await db.getClient();
		try {
			await client.query("BEGIN");
			let pass = await client.query(querystring, [cadena]);
			querystring =
				"INSERT INTO usuarios(email, password, fechacreacion, fechaactualizacion, fechabaja, nombre, apellido1, apellido2, comentarios, empresa_defecto) " +
				" VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id";
			let data = await db
				.query(querystring, [
					req.body.email,
					pass.rows[0].crypt,
					"now()",
					"now()",
					null,
					req.body.nombre,
					req.body.apellido1,
					req.body.apellido2,
					req.body.comentarios,
					req.body.empresas[0],
				])
				.then(async (data) => {
					querystring =
						"INSERT INTO usuarios_empresas (id_usuario, empresa_id) " +
						" VALUES ($1, $2) RETURNING id_usuario";
					for (var i = 0; i < req.body.empresas.length; i++) {
						let emp = await db.query(querystring, [
							data.rows[0].id,
							req.body.empresas[i],
						]);
					}
					await client.query("COMMIT");
					client.release();
					//Confirmamos el alta mediante un email

					logger.log(
						new Date().toLocaleString(),
						"#Insert Nuevo Usuario Ok!: " + data.rows[0].id
					);
					//Enviamos mensaje de confirmacion
					usuarioalta.id = data.rows[0].id;
					usuarioalta.link = pass.rows[0].crypt;
					usuarioalta.plantilla = "Pass_User.ejs";
					usuarioalta.asunto = "Urgente! bGoal360 Confirmar Alta";
					mail.enviar_email(usuarioalta);
					res.json(data.rows[0].id);
				})
				.catch(async (error) => {
					logger.error(new Date().toLocaleString(), error.message);
					await client.query("ROLLBACK");
					client.release();
					logger.error("Error: " + error.message);
					res.json({ id: error.message });
				});
		} catch (error) {
			await client.query("ROLLBACK");
			client.release();
			logger.error("Error: " + error.message);
			res.json({ id: error.detail });
		}
	})().catch(async (error) => {
		await client.query("ROLLBACK");
		client.release();
		logger.error("Error: " + error.message);
		res.json({ id: error.message });
	});
});
router.get("/usuarioconfirm", async function (req, res, next) {
	console.log(req.query.id);
	let params = req.query.id.split(",");
	let id = params[0];
	let plantilla = params[1];

	//TODO Cambiar en Explotacion
	if (plantilla == "F") {
		res.render("password_change", {
			id: id,
			titulo: "¿Olvidaste tú contraseña? ...",
			mensaje: "Ahora puedes cambiarla",
		});
	} else {
		let reg = await updateusuario(req.query.id, "bloqueado", "N");
		res.render("password_change", {
			id: id,
			titulo: "Cambia tú contraseña! ...",
			mensaje: "Al confirmar tú alta, debes cambiar tú contraseña",
		});
	}
});

router.post("/userchangepassword", async function (req, res, next) {
	console.log(req.body.id);
	let querystring = "SELECT crypt($1, gen_salt('bf', 10)) ";
	let pass = await db.query(querystring, [req.body.password]);
	querystring =
		"UPDATE usuarios set password = $1 WHERE password=$2 returning id;";
	await db
		.query(querystring, [pass.rows[0].crypt, req.body.id])
		.then((data) => {
			console.log(data);
		})
		.catch((error) => {
			logger.error("Error: " + error.message);
			next(error);
		});
	res.redirect("/logout", {
		mensaje: "COntraseña cambiada.",
	});
});
// Peticion AJAX de Grid para listado de usuarios
router.get("/listausuarios", async (req, res) => {
	(async () => {
		var sqlstring =
			"SELECT id, email, password, fechacreacion, fechaactualizacion, fechabaja, nombre, apellido1, apellido2, comentarios,bloqueado ";
		sqlstring += "FROM usuarios ORDER BY nombre;";
		await db
			.query(sqlstring)
			.then(async (data) => {
				lista = [];
				for (var i = 0; i < data.rowCount; i++) {
					let usuario =
						parseInt(data.rows[i].id) === "undefined"
							? 0
							: parseInt(data.rows[i].id);

					var sqlempresas =
						"SELECT empresa_id FROM usuarios_empresas WHERE id_usuario = $1 ORDER by empresa_id;";
					await db.query(sqlempresas, [usuario]).then((empresas) => {
						for (var j = 0; j < empresas.rowCount; j++) {
							lista.push(empresas.rows[j].empresa_id);
						}
					});
					data.rows[i].empresas = lista;
					lista = [];
				}
				res.json(data.rows);
			})
			.catch((error) => {
				logger.error(new Date().toLocaleString(), error.message);
			});
	})().catch((error) => {
		logger.error(new Date().toLocaleString(), error.mesage);
	});
});
// Peticion AJAX de Usuario Session para Configuracion Header
router.post("/usuariosession", async (req, res) => {
	let idusuario = await utilidades.leerusuariosesion(req.sessionID);
	var sqlstring =
		"SELECT id, email, password, fechacreacion, fechaactualizacion, fechabaja, nombre, apellido1, apellido2, comentarios ";
	sqlstring += "FROM usuarios WHERE id = $1 ORDER BY nombre;";
	await db
		.query(sqlstring, [idusuario])
		.then((data) => {
			res.json(data.rows);
		})
		.catch((error) => {
			logger.error(new Date().toLocaleString(), error);
		});
});
//Actualizamos la columna que nos llegue en el request
router.put("/updateusuarios", async (req, res) => {
	let newvalor = req.body.newvalor;
	let columna = req.body.col;
	let usuario_id = req.body.usuario_id;
	let reg = 0;
	if (req.body.newvalor === undefined) {
		newvalor = req.body["newvalor[]"];
	}
	//Si cambiamos empresas es un Array
	if (columna == "empresas") {
		reg = await updateusuarioempresas(usuario_id, columna, newvalor);
	} else {
		reg = await updateusuario(usuario_id, columna, newvalor);
	}

	if (reg == 1) {
		logger.log(new Date().toLocaleString(), "#Update Usuario", "Ok");
	} else {
		logger.error(new Date().toLocaleString(), "#Update Usuario", "Error");
	}
	res.json(reg);
});

//Actualizamos el Reg. del Usuario Completo
router.put("/updateusuariosconfig", async (req, res) => {
	var usuario = req.body;
	usuario.id = await utilidades.leerusuariosesion(req.sessionID);
	var reg = await updateusuarioconfig(usuario);
	if (reg) {
		logger.log(new Date().toLocaleString(), "#Update Usuario", "Ok", reg);
	} else {
		logger.error(
			new Date().toLocaleString(),
			"#Update Usuario",
			"Error",
			reg
		);
	}
	res.json("Ok");
});
router.put("/deleteusuarios", async (req, res) => {
	var reg = await deleteusuario(req.body.usuario_id, req.body.newvalor);
	if (reg == 1) {
		logger.log(
			new Date().toLocaleString(),
			"#Delete Usuario",
			req.body.usuario_id,
			"Ok"
		);
	} else {
		logger.error(
			new Date().toLocaleString(),
			"#Delete Usuario",
			req.body.usuario_id,
			"Error"
		);
	}
	res.json(reg);
});
// Borramos la empresa (Borrado Logico)
router.get("/usuariosborrar/:id", async function (req, res) {
	var querystring =
		"UPDATE usuarios set (fechabaja,fechaactualizacion,motivobajaid) = ($1,$2) WHERE idempresa=$3;";
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
			res.redirect("/usuarios/usuarioslistado");
		})
		.catch((error) => {
			logger.error(
				new Date().toLocaleString(),
				"#Error: " + error.message
			);
			res.render("usuarios/usuariosalta", {
				error: "Error al insertar en BBDD Tabla: usuarios",
			});
		});
});
// Damos de alta (Logica) Usuario
router.post("/usuariosdardealta/:id", async function (req, res) {
	var querystring =
		"UPDATE usuarios set (fechabaja,fechaactualizacion) = ($1,$2) WHERE idempresa=$3;";
	await db
		.query(querystring, [null, null, "now()", req.params.id])
		.then((data) => {
			logger.log(
				new Date().toLocaleString(),
				"#Recupero  Usuario: " + req.params.id
			);
			res.redirect("/usuarios/usuarioslistado");
		})
		.catch((error) => {
			logger.error("Error: " + error.message);
			res.render("usuarios/usuariosmod", {
				error: "Error al insertar en BBDD Tabla: usuarios",
			});
		});
});
//Actualiza columna de Usuarios desde Lista Usuarios
async function updateusuario(usuario_id, col, newvalor) {
	var result = 0;
	querystring =
		"UPDATE usuarios  set " +
		col +
		"=$2,fechaactualizacion = $3 WHERE id=$1";
	await db
		.query(querystring, [usuario_id, newvalor, "now()"])
		.then((data) => {
			result = data.rowCount;
			logger.log(
				new Date().toLocaleString(),
				"#Update  usuario: " + usuario_id
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

// Actualizacion especial de la columna empresas de usuarios
// La primera empresa del Array sera la empresa por defecto. El resto actualizan la tabla empresas_usuarios
async function updateusuarioempresas(usuario_id, col, newvalor) {
	let empresas = newvalor.split(",");
	col = "empresa_defecto";
	let result = "";
	querystring =
		"UPDATE usuarios  set " +
		col +
		"=$1,fechaactualizacion = $2 WHERE id=$3";
	const client = await db.getClient();
	await client.query("BEGIN");
	await client
		.query(querystring, [empresas[0], "now()", usuario_id])
		.then(async (data) => {
			querystring = "DELETE FROM usuarios_empresas WHERE id_usuario = $1";
			result = await client.query(querystring, [usuario_id]);
			querystring =
				"INSERT INTO usuarios_empresas (id_usuario, empresa_id) " +
				" VALUES ($1, $2);";
			for (var i = 0; i < empresas.length; i++) {
				result = await client.query(querystring, [
					usuario_id,
					empresas[i],
				]);
				logger.log(
					new Date().toLocaleString(),
					"#Insert Nuevo Usuario Ok!: " + result.rowCount
				);
			}
			await client.query("COMMIT");
			client.release();
			logger.log(
				new Date().toLocaleString(),
				"#Insert Nuevo Usuario Ok!: " + usuario_id
			);
			result = 1;
		})
		.catch(async (error) => {
			logger.error(new Date().toLocaleString(), error.message);
			await client.query("ROLLBACK");
			client.release();
			logger.error("Error: " + error.message);
			result = 0;
		});
	return result;
}
// Actualizacion de Usuarios Comun desde SideBar
async function updateusuarioconfig(usuarioconfig) {
	let querystring = "SELECT crypt($1, gen_salt('bf', 10)) ";
	let pass = await db.query(querystring, [usuarioconfig.password]);
	querystring =
		"UPDATE usuarios set (nombre,apellido1,apellido2,password) = ($1,$2,$3,$4) WHERE id=$5 returning id;";
	await db
		.query(querystring, [
			usuarioconfig.nombre,
			usuarioconfig.apellido1,
			usuarioconfig.apellido2,
			pass.rows[0].crypt,
			usuarioconfig.id,
		])
		.then((data) => {
			return data;
		})
		.catch((error) => {
			logger.error("Error: " + error.message);
			return null;
		});
}
async function deleteusuario(usuario_id, newvalor) {
	if (newvalor == "") {
		newvalor = "now()";
	} else {
		newvalor = null;
	}
	var result = 0;
	querystring =
		"UPDATE usuarios  set fechabaja = $2,fechaactualizacion = $3 WHERE id=$1";
	await db
		.query(querystring, [usuario_id, newvalor, "now()"])
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

module.exports = router;
