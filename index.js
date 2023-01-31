const https = require("https");
require("dotenv").config();
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const cors = require("cors");

const PORT = 3000;

//middleware

app.use(bodyParser.json({ limit: "500mb", parameterLimit: 50000 }));

app.use(
	express.urlencoded({
		limit: "500mb",
		extended: false,
		parameterLimit: 50000,
	})
);
app.use(clientErrorHandler);
app.use(cookieParser());
app.use(flash());
// app.use(function (req, res, next) {
// 	res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
// 	res.header(
// 		"Access-Control-Allow-Headers",
// 		"Origin, X-Requested-With, Content-Type, Accept"
// 	);
// 	next();
// });

app.use(
	cors({
		//origin: "http://localhost:3001",
		origin: "*",
		methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
		credentials: true,
	})
);
// pg init and config
const { Pool } = require("pg");
const conObject = {
	user: process.env.pgUSER,
	host: process.env.pgHOST,
	database: process.env.pgDATABASE,
	password: process.env.pgPASS,
	port: process.env.pgPORT,
};

const pool = new Pool(conObject);
pool.connect();

// session store and session config
const store = new (require("connect-pg-simple")(session))({
	conObject,
});

app.use(
	session({
		store: store,
		secret: process.env.SESSION_SECRET,
		saveUninitialized: false,
		resave: false,
		cookie: {
			secure: false,
			httpOnly: false,
			sameSite: false,
			maxAge: 1000 * 60 * 60 * 3,
		},
	})
);
app.use(function (req, res, next) {
	res.locals.mensajeOk = req.flash("mensajeOk");
	res.locals.mensajeError = req.flash("mensajeError");
	res.locals.idempresa = req.flash("idempresa");
	next();
});
app.use(expressLayouts);
//Settings Entornos, Vistas, Layouts y Partials
process.env.TZ = "Europe/Paris";
console.log(new Date().toLocaleString());

app.set("views", path.join(__dirname, "./src/views"));
app.set("view engine", "ejs");

app.set("layout", "./layouts/full-width");
app.set("data", path.join(__dirname, "data"));
app.set("modulos", path.join(__dirname, "modulos"));
// Ficheros estaticos
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.static(path.join(__dirname, "./src/modulos")));
console.log("Arrancamos en ..: ", __dirname);

//Definimos Rutas
var indexRouter = require("./src/routes/index");
var objetivosRouter = require("./src/routes/objetivos");
var empresasRouter = require("./src/routes/empresas.js");
var usuariosRouter = require("./src/routes/usuarios.js");

const PRIVATE_KEY = fs.readFileSync("./src/key.pem");
const PUBLIC_KEY = fs.readFileSync("./src/cert.pem");

var httpsOptions = {
	key: PRIVATE_KEY,
	cert: PUBLIC_KEY,
};

//Montamos Rutas

app.use("/", indexRouter);
app.use("/objetivos", objetivosRouter);
app.use("/empresas", empresasRouter);
app.use("/usuarios", usuariosRouter);

app.use(function (err, req, res, next) {
	console.error(err.stack);
	next(err);
});

function clientErrorHandler(err, req, res, next) {
	if (req.xhr) {
		res.status(500).render("error", {
			title: "Oooops! Lo sentimos",
			leererror: err.status,
		});
	} else {
		next(err);
	}
}
// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// Mostramos error generico
	res.status(err.status).render("error", {
		title: "Oooops! Lo sentimos",
		leererror: res.locals.error + " -" + res.locals.message,
		layout: "./layouts/full-width",
	});
});
process.on("uncaughtException", (err) => {
	console.error("There was an uncaught error", err);
	// Mostramos error generico
});
app.listen(PORT);
//https.createServer(httpsOptions, app).listen(4433);
console.log(new Date().toLocaleString(), "Server baculo360 on port", PORT);

module.exports = app;
