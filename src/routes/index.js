const { Router } = require('express');
var fs = require('fs');
const path = require('path');
//const console = require('console');
const { Console } = require('node:console');
const utilidades = require('../modulos/utilidades');
const router = Router();
const db = require('../db/index.cjs');
const { Pool } = require('pg');
const mail = require('../modulos/mailto');

////////////////////////////////////////////////////
// DEFINICIONES GLOBALES Y DECLARACIONES
///////////////////////////////////////////////////.

// const conObject = {
//   user: process.env.pgUSER,
//   host: process.env.pgHOST,
//   database: process.env.pgDATABASE,
//   password: process.env.pgPASS,
//   port: process.env.pgPORT,
// };

// const pool = new Pool(conObject);
// pool.connect();

const output = fs.createWriteStream(path.join(__dirname, '../console.log'));
const errorOutput = fs.createWriteStream(path.join(__dirname, '../error.log'));

// Custom simple logger
const logger = new Console({ stdout: output, stderr: errorOutput });
logger.log(path.join(__dirname, '../'));

router.get('/', (req, res, next) => {
	res.render('login', { title: '' });
});

router.post('/identificacion', async (req, res, next) => {
	logger.log(new Date().toLocaleString(), '#Identificacion ....');
	const client = await db.getClient();
	(async () => {
		// var client = await db.getClient();
		try {
			await client.query('BEGIN');
			sqlstring =
				'SELECT u.id, u.email, u.password, u.fechacreacion, u.fechaactualizacion, u.fechabaja, ' +
				'u.nombre, u.apellido1, u.apellido2, u.comentarios, ec.id as empresa_defecto ' +
				'FROM usuarios u,empresas_config ec WHERE u.email = $1 AND u.password  = crypt($2, u.password) AND ec.id = u.empresa_defecto ' +
				"AND u.fechabaja is null AND u.bloqueado = 'N';";
			const data = await client.query(sqlstring, [
				req.body.idusuario,
				req.body.idpassword,
			]);
			if (
				data.rowCount === 0 ||
				data.rows[0].email != req.body.idusuario
			) {
				res.render('error_login', {
					leererror: 'Usuario o password incorrecto',
					origen: 'login',
				});
			}
			//TODO: Leer usuarios_session y comprobar que ya esta logado con otro Navegador
			sqlstring =
				'INSERT INTO usuarios_session ' +
				'(idusuario,sid,idempresa, iniciosession) values ($1,$2,$3,$4) RETURNING idusuario;';
			await client.query(sqlstring, [
				data.rows[0].id,
				req.session.id,
				data.rows[0].empresa_defecto,
				'now()',
			]);

			await client.query('COMMIT');
			req.session.usuario = data.rows[0].id;
			res.redirect('objetivos/portada');
		} catch (error) {
			await client.query('ROLLBACK');
			if (error.code == '23505') {
				logger.error(
					new Date().toLocaleString(),
					'Usuario ya registrado, session duplicada',
					error.code + '. ' + error.message
				);
				res.render('error_login', {
					leererror:
						error.code +
						'. ' +
						'Usuario ya registrado en la session. Debe cerrar el Navegador',
					origen: 'sesion',
				});
			} else {
				logger.error(
					new Date().toLocaleString(),
					'ERROR, ROLLBACK',
					error.code + '. ' + error.message
				);
			}
		} finally {
			client.release();
		}
	})().catch((error) => {
		next(error);
	});
});

router.post('/forgotpassword', async function (req, res, next) {
	let usuario = {};
	sqlstring =
		'SELECT u.id,u.nombre,u.apellido1,u.apellido2,u.email,u.password FROM usuarios u,empresas_config ec WHERE u.email = $1 ' +
		"AND u.fechabaja is null AND u.bloqueado = 'N';";
	// En este caso el idusuario corresponde al email. (Login)
	const data = await db.query(sqlstring, [req.body.idusuario]);
	// Enviamos el mensaje de Cambio de Password
	if (data.rowCount > 0) {
		usuario.plantilla = 'Pass_Forgot.ejs';
		usuario.nombre = data.rows[0].nombre;
		usuario.apellido1 = data.rows[0].apellido1;
		usuario.apellido2 = data.rows[0].apellido2;
		usuario.email = data.rows[0].email;
		usuario.id = data.rows[0].id;
		usuario.link = data.rows[0].password;
		usuario.asunto = 'Urgente! bSales360 Olvidaste tú contraseña';
		mail.enviar_email(usuario);
	} else {
		res.render('error_login', {
			leererror: 'Usuario dado de baja, hable con su administrador',
			origen: 'baja',
		});
	}
	res.redirect('/');
});
router.get('/perfil', (req, res) => {
	res.render('perfil', { title: 'About Page', layout: './layouts/sidebar' });
});
router.get('/logout', async (req, res) => {
	if (req.session) {
		sqlstring =
			'UPDATE usuarios_session SET finsession = $1 WHERE sid = $2';

		await db.query(sqlstring, ['now()', req.session.id]);

		req.session.destroy((err) => {
			if (err) {
				res.render('logout', {
					mensaje: 'Gracias por utilizar bGoal360.',
				});
			} else {
				res.render('logout', {
					mensaje: 'Gracias por utilizar bGoal360.',
				});
			}
		});
	} else {
		res.end();
	}
});

module.exports = router;
