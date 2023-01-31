const pdfPrinter = require("pdfmake");
//const blobStream = require("blob-stream");
const fs = require("fs");
const db = require("../db/index.cjs");

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
// const client =  pool.connect();

const output = fs.createWriteStream(path.join(__dirname, "../console.log"));
const errorOutput = fs.createWriteStream(path.join(__dirname, "../error.log"));
// Custom simple logger
const logger = new Console({ stdout: output, stderr: errorOutput });

module.exports = {
	async leerusuario(req, res, usuario_email) {
		try {
			var datos = await db.query(
				"SELECT u.id, u.nombre, u.apellido1, u.email FROM  usuarios u WHERE u.email = $1;",
				[usuario_email]
			);
			if (datos.rowCount > 0) {
				req.session.idusuario = datos.rows[0].id;
				return datos;
			} else {
				return null;
			}
		} catch (error) {
			console.log(error);
			return null;
		} finally {
			//await client.release();
		}
	},
	async cargaempresasusuario(req, res, usuario_session) {
		try {
			var datos = await db.query(
				"SELECT e.id,e.empresa_id, e.nombre,u.empresa_defecto FROM usuarios_empresas ue, empresas_config e, usuarios u WHERE  ue.id_usuario = u.id AND e.id = ue.empresa_id AND u.id = $1 ORDER BY u.empresa_defecto;",
				[usuario_session]
			);
			if (datos.rowCount > 0) {
				req.session.idempresa = datos.rows[0].empresa_defecto;
				return datos;
			} else {
				return null;
			}
		} catch (error) {
			console.log(error);
			return null;
		} finally {
			//await client.release();
		}
	},
	async leerusuariosesion(session) {
		//var client = await db.getClient();
		try {
			if (!session) {
				return false;
			}
			var regs = await db.query(
				"SELECT us.idusuario FROM usuarios_session us WHERE us.sid = $1;",
				[session]
			);
			logger.log(
				new Date().toLocaleString() + "leerempresa session: ",
				regs.rows[0].idusuario
			);
			if (regs.rowCount > 0) {
				return regs.rows[0].idusuario;
			} else {
				return false;
			}
		} catch (error) {
			logger.error(new Date().toLocaleString(), error);
			error.message = "La session ha caducado";
			return false;
		}
	},
	async leerempresasession(session) {
		try {
			//var client = await db.getClient();
			if (!session || session === null || session === undefined) {
				return false;
			}
			var regs = await db.query(
				"SELECT us.idempresa FROM usuarios_session us WHERE us.sid = $1;",
				[session]
			);

			if (regs.rowCount > 0) {
				logger.log(
					new Date().toLocaleString() + "#leerempresa session: ",
					regs.rows[0].idempresa
				);
				return regs.rows[0].idempresa;
			} else {
				logger.error(
					new Date().toLocaleString() +
						"#leerempresa session: No puedo leer la empresa de session o session caducada",
					session
				);
				return false;
			}
		} catch (error) {
			logger.error(new Date().toLocaleString(), error);
			error.message = "La session ha caducado";
			return false;
		} finally {
			//await client.release();
		}
	},
	async cambioempresasession(session, idempresa) {
		try {
			//var client = await db.getClient();
			var regs = await db.query(
				"UPDATE usuarios_session SET idempresa = $1 WHERE sid = $2 returning idempresa;",
				[idempresa, session]
			);
			logger.log(
				new Date().toLocaleString() + "#Actualiza empresa session: ",
				session,
				idempresa
			);
			if (regs.rowCount > 0) {
				return regs.rows[0].idempresa;
			} else {
				return false;
			}
		} catch (error) {
			logger.error(new Date().toLocaleString(), error);
			error.message = "La session ha caducado";
			return false;
		} finally {
			//await client.release();
		}
	},
	async cargapoblaciones(p_idprovincia) {
		try {
			var datos = await db.query(
				"select distinct  p.poblacion from municipios p where left(p.codigopostal,2)= $1 ORDER BY p.poblacion",
				[p_idprovincia]
			);
			return datos;
		} catch {
			return null;
		}
	},
	async cargacodigospostales(p_poblacionid, p_idprovincia) {
		try {
			var datos = await db.query(
				"select distinct p.codigopostal from municipios p where p.poblacion= $1 AND left(p.codigopostal,2)= $2 ORDER BY codigopostal",
				[p_poblacionid, p_idprovincia]
			);
			return datos;
		} catch {
			return null;
		}
	},
	async cargatipossociedad() {
		try {
			var datos = await db.query(
				"SELECT t.idtipo, t.descripcion FROM tipossociedad t ORDER BY t.descripcion ASC"
			);

			return datos;
		} catch (err) {
			console.log(err);
			return null;
		}
	},
	async cargaregimenivas() {
		try {
			var datos = await db.query(
				"SELECT t.idregiva, t.descripcion FROM regimenivas t ORDER BY t.descripcion ASC"
			);

			return datos;
		} catch (err) {
			console.log(err);
			return null;
		}
	},
	async cargaorigenoperaciones() {
		try {
			var datos = await db.query(
				"SELECT t.idorigen, t.descripcion FROM origenoperaciones t ORDER BY t.descripcion ASC"
			);

			return datos;
		} catch (err) {
			console.log(err);
			return null;
		}
	},
	async cargadepartamentos() {
		try {
			var datos = await db.query(
				"SELECT t.iddepartamento, t.descripcion FROM departamentos t ORDER BY t.descripcion ASC"
			);
			return datos;
		} catch (err) {
			console.log(err);
			return null;
		}
	},
	async cargacargos() {
		try {
			var datos = await db.query(
				"SELECT t.idcargo, t.descripcion FROM cargos t ORDER BY t.descripcion ASC"
			);
			return datos;
		} catch (err) {
			console.log(err);
			return null;
		}
	},
	async cargaempresas(p_empresaid) {
		try {
			var datos = "";
			if (p_empresaid != null) {
				datos = await db.query(
					"SELECT t.idempresa, t.nombrecomercial from empresas t WHERE t.idempresa =$1 ORDER BY t.nombrecomercial",
					[p_empresaid]
				);
			} else {
				datos = await db.query(
					"SELECT t.idempresa, t.nombrecomercial from empresas t  ORDER BY t.nombrecomercial"
				);
			}
			return datos;
		} catch {
			console.log(err);
			return null;
		}
	},
	async cargacontactos(p_empresaid) {
		try {
			var datos = await db.query(
				"select p.idcontacto,p.nombre,p.apellido1,p.apellido2  from contactos p where p.empresaid= $1 ORDER BY p.nombre",
				[p_empresaid]
			);
			console.log(datos);
			return datos;
		} catch {
			console.log(err);
			return null;
		}
	},
	async cargaestados(p_tabla) {
		try {
			var datos = await db.query(
				"select * from estados p where p.idtabla= $1 ORDER BY p.descripcion",
				[p_tabla]
			);
			return datos;
		} catch {
			console.log(err);
			return null;
		}
	},
	// Create a function for reusable perpose (kynkacode.com )
	async generateRandomString(myLength) {
		const chars =
			"AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890";
		const randomArray = Array.from(
			{ length: myLength },
			(v, k) => chars[Math.floor(Math.random() * chars.length)]
		);

		const randomString = randomArray.join("");
		return randomString;
	},
	//-------------------------
	// PDF Maker
	//--------------------------
	async ActividadPDFMaker(p_idactividad, p_idproyecto, res, destino) {
		var now = new Date();
		var fonts = {
			Roboto: {
				normal: "public/fonts/Poppins/Poppins-Regular.ttf",
				bold: "public/fonts/Poppins/Poppins-Medium.ttf",
				italics: "public/fonts/Poppins/Poppins-Italic.ttf",
				bolditalics: "public/fonts/Poppins/Poppins-MediumItalic.ttf",
			},
		};
		var printer = new pdfPrinter(fonts);
		// SQL Actividad Full
		var data = await db.query(SQLString.getActividadFull(), [
			p_idactividad,
			p_idproyecto,
		]);
		var informe = {
			pageSize: "A4",
			pageMargins: [20, 70, 20, 40],
			pageOrientation: "landscape",
			header: [
				{
					style: "header",
					table: {
						headerRows: 1,
						widths: [200, 300, 200],
						body: [
							[
								{
									image: "public/Images/Logo_Baculo.jpg",
									width: 140,
									height: 60,
								},
								{
									text: "\n" + data.rows[0].nombrecomercial,
									color: "gray",
									alignment: "center",
								},

								{
									text: "\n\n" + now.toLocaleDateString(),
									color: "gray",
									alignment: "right",
									fontSize: 14,
								},
							],
						],
					},
					layout: "noBorders",
				},
			],
			footer: {
				columns: [
					{
						image: "public/Images/_Baculo_Circulo_0.png",
						width: 15,
						height: 15,
						alignment: "left",
						style: "pie",
					},
					{
						width: 3,
						text: " ",
						style: "pie",
						alignment: "center",
					},
					{
						image: "public/Images/_Baculo_Por_Vacio_0.png",
						width: 15,
						height: 15,
						alignment: "right",
						style: "pie",
					},
					{
						width: 140,
						text: "  Sin Valorar",
						style: "pie",
						alignment: "center",
					},
					{
						image: "public/Images/_Baculo_Circulo_1.png",
						width: 15,
						height: 15,
						alignment: "left",
						style: "pie",
					},
					{
						width: 120,
						text: "  Bajo",
						style: "pie",
						alignment: "center",
					},
					{
						image: "public/Images/_Baculo_Circulo_3.png",
						width: 15,
						height: 15,
						alignment: "left",
						style: "pie",
					},
					{
						width: 120,
						text: " Medio",
						style: "pie",
						alignment: "center",
					},
					{
						image: "public/Images/_Baculo_Circulo_4.png",
						width: 15,
						height: 15,
						alignment: "left",
						style: "pie",
					},
					{
						width: 120,
						text: " Alto",
						style: "pie",
						alignment: "center",
					},
					{
						width: 250,
						text: "Copy Right baculo360",
						style: "pie",
						alignment: "right",
					},
				],
			},
			content: [
				[
					{
						style: "subheader",
						table: {
							widths: [200, 550],
							body: [
								[
									{
										text: "\nProyecto: ",
										alignment: "right",
									},
									{
										text:
											"\n" + data.rows[0].proyecto_nombre,
										alignment: "left",
										color: "#0088AA",
									},
								],
							],
						},
						layout: "headerLineOnly",
					},
					{
						style: "normal",
						table: {
							widths: [
								"auto",
								"auto",
								"auto",
								"auto",
								"auto",
								"auto",
							],
							body: [
								[
									{ text: "Area:" },
									{
										text: data.rows[0].area_nombre,
										style: "tableNormal",
									},
									{ text: "Proceso:" },
									{
										text: data.rows[0].proceso_nombre,
										style: "tableNormal",
									},
									{ text: "Acción:" },
									{
										text: data.rows[0].descripcion,
										style: "tableNormal",
									},
								],
							],
						},
						layout: "headerLineOnly",
					},
					{
						canvas: [
							{
								type: "line",
								x1: 40,
								y1: 3,
								x2: 740,
								y2: 0,
								lineWidth: 1,
							},
						],
					},
					// Tabla de Datos
					{
						style: "normal",
						table: {
							headerRows: 1,
							widths: [
								"auto",
								"auto",
								"auto",
								"auto",
								"auto",
								"auto",
								"auto",
							],
							body: [
								[
									"Fecha Inicial",
									"Fecha FInal",
									"Impacto",
									"Esfuerzo",
									"Alcance Funcional",
									"Satisfaccion",
									"Prioridad",
								],
								[
									{
										text: data.rows[0]
											.fecha_inicio_prevista,
										alignment: "center",
										style: "tableNormal",
									},
									{
										text: data.rows[0].fecha_fin_prevista,
										alignment: "center",
										style: "tableNormal",
									},
									{
										image:
											"public/Images/_Baculo_Circulo_" +
											data.rows[0].impacto +
											".png",
										width: 15,
										height: 15,
										alignment: "center",
										style: "tableNormal",
									},
									{
										image:
											"public/Images/_Baculo_Circulo_" +
											data.rows[0].esfuerzo +
											".png",
										width: 15,
										height: 15,
										alignment: "center",
										style: "tableNormal",
									},
									{
										image:
											"public/Images/_Baculo_Por_Vacio_" +
											data.rows[0].funcional +
											".png",
										width: 15,
										height: 15,
										alignment: "center",
										style: "tableNormal",
									},

									{
										image:
											"public/Images/_Baculo_Por_Vacio_" +
											data.rows[0].satisfaccion +
											".png",
										width: 15,
										height: 15,
										alignment: "center",
										style: "tableNormal",
									},
									{
										image:
											"public/Images/_Baculo_Circulo_" +
											data.rows[0].prioridad +
											".png",
										width: 15,
										height: 15,
										alignment: "center",
										style: "tableNormal",
									},
								],
							],
						},
						layout: "headerLineOnly",
					},
					{
						style: "normal",
						table: {
							headerRows: 1,
							widths: [
								"auto",
								"auto",
								"auto",
								"auto",
								"auto",
								"auto",
								"auto",
							],
							body: [
								[
									"Avance",
									"        ",
									"     ",
									"Contacto Cte",
									"Contacto baculo360",
									"Sistema",
									"Estado",
								],
								[
									{
										image:
											"public/Images/_Baculo_Por_Vacio_" +
											data.rows[0].avance +
											".png",
										width: 15,
										height: 15,
										alignment: "center",
										style: "tableNormal",
									},
									{
										// text: data.rows[0].sesiones,
										text: "        ",
										alignment: "center",
										style: "tableNormal",
									},
									{
										//text: data.rows[0].horas,
										text: "     ",
										alignment: "center",
										style: "tableNormal",
									},
									{
										text: data.rows[0].nombre_cliente,
										alignment: "center",
										style: "tableNormal",
									},
									{
										text: data.rows[0].nombre_baculo,
										alignment: "center",
										style: "tableNormal",
									},
									{
										text: data.rows[0].sistema,
										alignment: "center",
										style: "tableNormal",
									},
									{
										text: data.rows[0].estado_descripcon,
										alignment: "center",
										style: "tableNormal",
									},
								],
							],
						},
						layout: "headerLineOnly",
					},

					{
						style: "normal",
						table: {
							headerRows: 1,
							widths: [350, 350],
							body: [
								["\nAs Is", "\nTo Be"],
								[
									{
										text: data.rows[0].observaciones,
										style: "tableNormal",
										alignment: "left",
									},
									{
										text: data.rows[0].mejora,
										style: "tableNormal",
										alignment: "left",
									},
								],
							],
						},
						layout: "headerLineOnly",
						alignment: "center",
					},
				],
			],
			styles: {
				header: {
					fontSize: 22,
					bold: true,
					margin: [40, 0, 0, 5],
				},
				subheader: {
					fontSize: 16,
					margin: [40, 5, 0, 10],
				},
				normal: {
					fontSize: 14,
					margin: [40, 0, 0, 0],
				},
				pie: {
					fontSize: 8,
					margin: [40, 0, 40, 0],
					color: "grey",
				},
				tableNormal: {
					margin: [0, 2, 0, 0],
					color: "grey",
					fontSize: 12,
				},
				tableOpacityExample: {
					margin: [0, 5, 0, 15],
					fillColor: "blue",
					fillOpacity: 0.3,
				},
				tableHeader: {
					bold: true,
					fontSize: 12,
					color: "blue",
				},
			},
			defaultStyle: {
				// alignment: 'justify'
			},
		};
		var pdfDoc = printer.createPdfKitDocument(informe);
		pdfDoc.end();
		var fichero =
			"ficheros/Actividad_" +
			data.rows[0].proyecto_nombre +
			"_" +
			data.rows[0].idactividad +
			now.getTime() +
			".pdf";
		pdfDoc.pipe(fs.createWriteStream(fichero));
		// Finalize PDF file

		if (destino === "R") {
			// Escribinos en el response
			res.setHeader("Content-Type", "application/pdf");
			pdfDoc.pipe(res);
		}
	},
};
