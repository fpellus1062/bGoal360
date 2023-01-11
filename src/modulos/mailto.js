const nodemailer = require("nodemailer");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const output = fs.createWriteStream(path.join(__dirname, "../console.log"));
const errorOutput = fs.createWriteStream(path.join(__dirname, "../error.log"));
const { Console } = require("node:console");
// Archivo Logs
const logger = new Console({ stdout: output, stderr: errorOutput });

// Configuramos el transporte para la cuenta de baculo360 - Outlook

this.enviar_email = async (params) => {
	var transporter = nodemailer.createTransport({
		host: process.env.HOST, //"smtp.office365.com", // hostname
		secureConnection: false, // TLS requires secureConnection to be false
		port: process.env.PORT, // port for secure SMTP
		tls: {
			ciphers: process.env.TLS,
		},
		auth: {
			user: process.env.USER,
			pass: process.env.PASS,
		},
		juiceResources: {
			images: false,
		},
	});

	// Configuramos la Plantilla de Envio
	var mipagina = "";
	var camino = path.join(
		__dirname,
		"./../views/plantillas/",
		params.plantilla
	);
	var imagenes = path.join(__dirname, "./../../public/images/F1.png");
	ejs.renderFile(
		path.join(camino),
		{ nombre: params.nombre, id: params.link },
		async function (err, str) {
			mipagina = str;
		}
	);

	var mailOptions = {
		from: '"Informacion" <consulting@baculo360.es>',
		to: `${params.email},fpellus@gmail.com`,
		subject: `${params.asunto}`,
		text: "", // plaintext body
		html: mipagina,
		attachments: [
			{
				filename: "F1.png",
				path: imagenes,
				cid: "F1",
			},
		],
	};

	// send mail with defined transport object
	transporter.sendMail(mailOptions, async function (error, info) {
		if (error) {
			return console.log(error);
		}

		console.log("Message sent: " + info.response);
	});
};
module.export = this;
