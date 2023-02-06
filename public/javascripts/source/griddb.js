import { cargadist } from "./ttable.js";
window.addEventListener("keydown", function (event) {
	if (event.ctrlKey && event.key === "z") {
		alert("Control Z");
		event.stopImmediatePropagation();
		event.preventDefault();
	}
});
var gcuentaniveles = [];
var data = {
	ix: [],
	hijos: [],
	padre: [],
	maxnivel: [],
};
var iconoGgrid = "";
const RESUMEN = document.getElementById("resumen").value;
const MAXIMONIVEL = document.getElementById("maxnivel").value;
const IDLAYOUT = document.getElementById("idlayout").value;
const IDVERSION = document.getElementById("idversion");
const VERSIONANTERIOR = document.getElementById("version").value;
const slider = document.getElementById("slider");
const texto = document.getElementById("slidertxt");

const mensaje = document.getElementById("mensaje");
const updateBtn = document.getElementById("updateBtn");
//const toast = document.querySelectorAll("smart-toast")[0];
const toast = document.getElementById("avisoerror");
const infotoats = document.getElementById("infotoats");
const sumapadres = document.getElementById("bp");

const COLUMNAS = [
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
const COLORES_FONDO = [
	"default",
	"default",
	"default",
	"default",
	"default",
	"default",
];
const COLORES_LETRA = [
	"default",
	"purple",
	"#802A00",
	"#B20057",
	"#007D06",
	"#9124F0",
];

var bloqueonivel = 0;
var FILA_INDEX = 0;
var IDVERSIONANTERIOR = "";
var mifilaanterior = [
	0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
];
var midiferencia = [
	0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
];
// ID Rows pendientes de Sumar a Padres
var filaspdtes = [];
$("#idempresa").attr("disabled", "disable");
var log = document.querySelector("#log");
sumapadres.checkStatus = true;
log.textContent = "Si";
slider.value = 0;

sumapadres.addEventListener("change", async function (event) {
	const checkStatus = event.detail.value;
	var texto = "";
	//calculapesos(grid.rows[FILA_INDEX]);
	//await calculapesosall();
	if (checkStatus === true) {
		log.textContent = "Si";
		sumapadres.checkStatus = true;
		slider.disabled = true;
		slider.value = 0;
		$(log).addClass("text-bg-success");
		$(log).removeClass("text-bg-danger");
		texto =
			'<a href="#"><span class="smart-badge smart-badge-success smart-badge-pill"><i class="fas fa-calculator"></i></span></a> &nbsp Trabajo';
		changeTab(3, texto);
		//infotoats.closeLast();
	} else {
		log.textContent = "No";
		sumapadres.checkStatus = false;
		slider.disabled = false;
		slider.value = 0;
		$(log).removeClass("text-bg-success");
		$(log).addClass("text-bg-danger");
		texto =
			'<a href="#"><span class="smart-badge smart-badge-danger smart-badge-pill"><i class="fas fa-calculator"></i></span></a> &nbsp Trabajo';
		changeTab(3, texto);
		//infotoats.closeLast();
		infotoats.itemTemplate = "template-toast";
		infotoats.open();
	}
});
infotoats.addEventListener("open", function () {
	document
		.getElementById("closeButton")
		.addEventListener("click", function () {
			infotoats.closeLast();
		});
});
function changeTab(ntab, texto) {
	tabs.update(ntab, texto);
}

function changeIcono(indice) {
	return iconoGgrid;
}

slider.addEventListener("change", async function (event) {
	const value = event.detail.value;
	texto.innerText = "Bloqueo Nivel: " + parseInt(value);
	bloqueonivel = parseInt(value);
	if (pi.checked) {
		cambiartipopeso("i");
	} else {
		cambiartipopeso("t");
	}
});

pt.addEventListener("change", function (event) {
	var texto = "";
	if (bloqueonivel > 0) {
		texto =
			'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Compañía <span class="smart-badge smart-badge-danger smart-badge-pill">' +
			bloqueonivel +
			"</span>";
	} else {
		texto =
			'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Compañía';
	}

	changeTab(1, texto);
});
pi.addEventListener("change", function (event) {
	var texto = "";
	if (bloqueonivel > 0) {
		texto =
			'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Individual <span class="smart-badge smart-badge-danger smart-badge-pill">' +
			bloqueonivel +
			"%</span>";
	} else {
		texto =
			'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Individual';
	}
	changeTab(1, texto);
});
$("#idversion").on("change", function (event) {
	if ($("#idversion").val() != $("#version").val()) {
		$("#updateBtn").removeClass("bg-azulbaculo").addClass("btn-danger");
	} else {
		// updateBtn.innerHTML = '<span> <i class="fas fa-save" aria-hidden="true"></i> Guardar </span>';
		$("#updateBtn").removeClass("btn-danger").addClass("bg-azulbaculo");
	}
});

updateBtn.addEventListener("click", function (event) {
	const allset = grid.selectAllRows();
	const allfilas = grid.getSelectedRows();
	const idlayout = $("#idlayout").val();
	//const idversion =  $('#idversion').val();
	const observaciones = $("#observaciones").val();

	const DIFGENERAL = parseFloat(Ggrid.getCellValue(5, COLUMNAS[0]));

	if (DIFGENERAL != parseFloat(0.0)) {
		grid.clearSelection();
		grid.refreshView();
		//toast.closeLast();
		toast.open();
		toast.type = "error";
		toast.value = "No puede grabar existen diferencias de reparto .....";
		Ggrid.setRowStyle(5, {
			fontFamily: "Poppins",
			background: "red",
			color: "white",
		});

		tabs.select(3);
		return;
	}
	allfilas.splice(0, 0, [
		0,
		{
			version: IDVERSION.value,
			versionanterior: VERSIONANTERIOR,
			observaciones: observaciones,
		},
	]);

	//toast.closeLast();
	toast.open();
	toast.type = "info";
	toast.value = "Guardando  Datos en BBDD .....";
	fetch(
		"http://localhost:3000/objetivos/recibeAjax/?uno=" +
			idlayout +
			"&dos=" +
			IDVERSION.value,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(allfilas),
		}
	)
		.then((response) => response.json())
		.then((data) => {
			if (data == "Ok") {
				toast.type = "success";
				toast.value = "Datos Guardados con Exito ";
			} else {
				toast.type = "error";
				toast.value = "Error al Guardar los datos \n" + data;
			}
			grid.clearSelection();
			grid.refreshView();
			toast.closeLast();
			toast.open();
			cargadist(1);
			//$(location).attr('href','/objetivos/descargafile');
			//$(location).attr('href','/objetivos/descargaexcel');
		})
		.catch((error) => {
			console.error("Error:", error);
		});
});

exportBtn.addEventListener("click", function (event) {
	//const allfilas = grid.getSelectedRows();
	//grid.exportData('xlsx');
	const allset = grid.selectAllRows();
	const allfilas = grid.getSelectedRows();
	const codigo = $("#codigo").val();

	fetch("http://localhost:3000/objetivos/descargafile/" + codigo, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(allfilas),
	})
		.then((response) => response.json())
		.then((data) => {
			grid.refreshView();
			$(location).attr("href", "/objetivos/descargaexcel");
		})
		.catch((error) => {
			console.error("Error:", error);
		});
	grid.clearSelection();
});

var cambiartipopeso = function (tipo) {
	if (tipo == "t") {
		if (bloqueonivel > 0) {
			tabs.update(
				1,
				'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Compañía <span class="smart-badge smart-badge-danger smart-badge-pill">' +
					bloqueonivel +
					"%</span>"
			);
		} else {
			tabs.update(
				1,
				'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Compañía'
			);
		}
	}
	if (tipo == "i") {
		if (bloqueonivel > 0) {
			tabs.update(
				1,
				'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Individual <span class="smart-badge smart-badge-danger smart-badge-pill">' +
					bloqueonivel +
					"%</span>"
			);
		} else {
			tabs.update(
				1,
				'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Indivdual'
			);
		}
	}
};
var calculapesosall = async function () {
	var ffilas = [];
	var limites = distable.getSelectedRows();
	if (limites.length > 0) {
		console.log("Limites: ", limites[0][1]);
		grid.expandAllRows();
		var minino = ">= " + limites[0][1].LimInf;
		var maximo = "<= " + limites[0][1].LimSup;
		grid.addFilter("Tot", minino, false);
		grid.addFilter("Tot", maximo, true);
	}
	grid.expandAllRows();

	//grid.setRowProperty(1, "freeze", false);
	//grid.highlightCell(1, "firstName", "cssClass");
	var filtro = "73 - BODEGAS DE LOS RIOS PRIETO S_L_";
	grid.addFilter("Descripcion", "CONTAINS" + filtro, true);
	document.getElementById("ceros").innerHTML =
		"Ceros -> " + "AZUCAR CAJA 1000 UDS_";
	//ffilas = grid.getVisibleRows();

	//ffilas = grid.findCells(1245.18);
	//ffilas = grid.find("Tot", 1245.18, "=");

	//grid.selectRowsByQuery(416.67, "Ene", "EQUAL");
	// grid.selectCellsByQuery("5000.00");
	//ffilas = grid.getSelectedRows();

	// var cuentaceros = 0;
	// for (var i = 0; i <= grid.rows.length; i++) {
	// 	var celda = grid.rows[i].cells[1];
	// 	if (celda.value === 0 && celda.row.level == MAXIMONIVEL) {
	// 		celda.background = "cyan";
	// 		//await operar(0, celda.value, celda.row, "Tot");
	// 		cuentaceros += 1;
	// 		ffilas.push(celda.row);
	// 	}
	// }
	document.getElementById("ceros").innerHTML =
		"Ceros -> " + cuentaceros.toString();
};

var calculapesos = function (fila) {
	var peso = 0;
	var gpeso = 0;
	var tnosuma = 0;
	var gtpeso = 0;
	var diferencia = 0;
	var padre = 0;

	if (fila.level == 0) {
		padre = 1;
	} else {
		padre = fila.parentId;
	}

	Ggrid.setRowStyle(5, {
		fontFamily: "Poppins",
		background: "default",
		color: "default",
	});
	Ggrid.beginUpdate();
	Ggrid.setCellValue(
		3,
		"Descripcion",
		grid.getCellValue(padre, "Descripcion") + " % S/ Grupo"
	);
	Ggrid.setCellValue(
		4,
		"Descripcion",
		grid.getCellValue(fila.id, "Descripcion") + " % S/ Su Total"
	);
	Ggrid.rows[3].cells[0].background = COLORES_FONDO[fila.level - 1];
	Ggrid.rows[4].cells[0].background = COLORES_FONDO[fila.level];
	//Ggrid.setRowStyle(4,{"background":COLORES_FONDO[fila.level]});
	var totaldiferencia = parseFloat(0.0);
	for (var i = 0; i <= 12; i++) {
		if (parseFloat(grid.getCellValue(padre, COLUMNAS[i])) == 0) {
			gpeso = 0.0;
			Ggrid.rows[2].cells[i + 1].background =
				COLORES_FONDO[fila.level - 1];
			Ggrid.rows[2].cells[i + 1].color = "default";
		} else {
			gpeso = redondea(
				(parseFloat(grid.getCellValue(fila.id, COLUMNAS[i])) /
					parseFloat(grid.getCellValue(padre, COLUMNAS[i]))) *
					100
			);
			if (
				parseFloat(gpeso) > parseFloat(bloqueonivel) &&
				parseFloat(bloqueonivel) != 0
			) {
				Ggrid.rows[2].cells[i + 1].background = "red";
				Ggrid.rows[2].cells[i + 1].color = "white";
			} else {
				Ggrid.rows[2].cells[i + 1].background =
					COLORES_FONDO[fila.level - 1];
				Ggrid.rows[2].cells[i + 1].color = "black";
			}
		}
		if (parseFloat(grid.getCellValue(fila.id, COLUMNAS[i])) == 0) {
			peso = 0.0;
			Ggrid.rows[3].cells[i + 1].background = COLORES_FONDO[fila.level];
			Ggrid.rows[3].cells[i + 1].color = "default";
		} else {
			peso = redondea(
				(parseFloat(grid.getCellValue(fila.id, COLUMNAS[i])) /
					parseFloat(grid.getCellValue(fila.id, COLUMNAS[0]))) *
					100
			);
			if (
				parseFloat(peso) > parseFloat(bloqueonivel) &&
				i > 0 &&
				parseFloat(bloqueonivel) != 0
			) {
				Ggrid.rows[3].cells[i + 1].background = "red";
				Ggrid.rows[3].cells[i + 1].color = "white";
			} else {
				Ggrid.rows[3].cells[i + 1].background =
					COLORES_FONDO[fila.level];
				Ggrid.rows[3].cells[i + 1].color = "default";
			}
		}
		gtpeso = redondea((gtpeso += parseFloat(gpeso)), 2);
		// diferencia = parseFloat(grid.getCellValue(1,COLUMNAS[i]))-parseFloat(Ggrid.getCellValue(1,COLUMNAS[i]));
		Ggrid.setCellValue(
			2,
			COLUMNAS[i],
			redondea(
				grid.getCellValue(1, COLUMNAS[i]) -
					Ggrid.getCellValue(1, COLUMNAS[i]),
				2
			)
		);

		Ggrid.setCellValue(3, COLUMNAS[i], redondea(parseFloat(gpeso), 2));
		Ggrid.setCellValue(4, COLUMNAS[i], redondea(parseFloat(peso), 2));
		//Cargamos diferencias
		Ggrid.setCellValue(
			5,
			COLUMNAS[i],
			redondea(parseFloat(midiferencia[i]), 2)
		);
		// Tabla TGrid Totales Cia
		Tgrid.setCellValue(3, COLUMNAS[i], grid.getCellValue(1, COLUMNAS[i]));
		Tgrid.setRowStyle(3, {
			fontFamily: "Poppins",
			background: "default",
			color: "#1cabe9",
		});
		//Peso Mensual
		Tgrid.setCellValue(
			4,
			COLUMNAS[i],
			redondea(
				parseFloat(
					(grid.getCellValue(1, COLUMNAS[i]) /
						grid.getCellValue(1, COLUMNAS[0])) *
						100
				),
				2
			)
		);
		//% Nuevo Total Vs Presupuesto Original.
		var diferencial = redondea(
			(parseFloat(Tgrid.getCellValue(3, COLUMNAS[i])) /
				parseFloat(Tgrid.getCellValue(1, COLUMNAS[i])) -
				1) *
				100,
			2
		);
		Tgrid.setCellValue(5, COLUMNAS[i], parseFloat(diferencial));
		if (diferencial >= 0) {
			Tgrid.setCellStyle(5, COLUMNAS[i], {
				background: "default",
				color: COLORES_LETRA[4],
			});
			Tgrid.setCellStyle(5, "Descripcion", {
				background: "default",
				color: COLORES_LETRA[4],
			});
		} else {
			Tgrid.setCellStyle(5, COLUMNAS[i], {
				background: "default",
				color: COLORES_LETRA[3],
			});
			Tgrid.setCellStyle(5, "Descripcion", {
				background: "default",
				color: COLORES_LETRA[3],
			});
		}

		// Si no acumulamos totales. Mostramos diferencias

		if (!sumapadres.checkStatus) {
			if (midiferencia.length != 0) {
				Ggrid.setCellValue(
					5,
					COLUMNAS[i],
					redondea(parseFloat(midiferencia[i]))
				);
			}
		}
	}
	Tgrid.setRowStyle(4, {
		fontFamily: "Poppins",
		background: "default",
		color: "#1cabe9",
	});
	if (parseFloat(Tgrid.getCellValue(5, COLUMNAS[0])) >= 0) {
		Tgrid.setRowStyle(5, {
			fontFamily: "Poppins",
			background: "default",
			color: COLORES_LETRA[4],
		});
	} else {
		Tgrid.setRowStyle(5, {
			fontFamily: "Poppins",
			background: "default",
			color: COLORES_LETRA[3],
		});
	}
	diferencia = redondea(
		parseFloat(grid.getCellValue(1, COLUMNAS[0])) -
			parseFloat(Ggrid.getCellValue(1, COLUMNAS[0]))
	);

	if (diferencia < 0) {
		Ggrid.setRowStyle(2, {
			fontFamily: "Poppins",
			background: "default",
			color: "red",
		});
		Tgrid.setRowStyle(3, {
			fontFamily: "Poppins",
			background: "default",
			color: "red",
		});
		Tgrid.setRowStyle(4, {
			fontFamily: "Poppins",
			background: "default",
			color: "red",
		});
	} else if (diferencia > 0) {
		Ggrid.setRowStyle(2, {
			fontFamily: "Poppins",
			background: "default",
			color: "#1cabe9",
		});
		Tgrid.setRowStyle(3, {
			fontFamily: "Poppins",
			background: "default",
			color: "#1cabe9",
		});
		Tgrid.setRowStyle(4, {
			fontFamily: "Poppins",
			background: "default",
			color: "#1cabe9",
		});
	} else {
		Ggrid.setRowStyle(2, {
			fontFamily: "Poppins",
			background: "default",
			color: "black",
		});
		Tgrid.setRowStyle(3, {
			fontFamily: "Poppins",
			background: "default",
			color: "black",
		});
		Tgrid.setRowStyle(4, {
			fontFamily: "Poppins",
			background: "default",
			color: "black",
		});
	}

	Ggrid.setCellValue(3, "Idx", parseFloat(fila.index));
	Ggrid.setCellValue(4, "Idx", parseFloat(fila.index));
	Ggrid.setCellValue(5, "Idx", parseFloat(fila.index));
	Ggrid.endUpdate();
	Ggrid.refreshView();
	grid.refreshView();
	return;
};
//Abrimos el arbol a partir de la fila, indicada, todos sus hijos (true / false) y color
var abrirarbol = function (fila, all, color) {
	grid.beginUpdate();
	grid.expandRow(fila.id);

	grid.setRowStyle(fila.id, {
		fontFamily: "Poppins",
		fontWeight: 600,
		background: COLORES_FONDO[fila.level],
		color: COLORES_LETRA[fila.level],
	});

	if (fila.children != undefined) {
		fila.children.forEach((hijo) => {
			if (color && hijo.level < MAXIMONIVEL) {
				grid.setRowStyle(hijo.id, {
					fontFamily: "Poppins",
					background: COLORES_FONDO[hijo.level],
					color: COLORES_LETRA[hijo.level],
				});
			}
			if (hijo.children.length > 0 && all) {
				abrirarbol(hijo, true, color);
			}
		});
	}
	grid.endUpdate();
	return;
};
var contarniveles = function (fila) {
	const nivel = fila.level;
	var n = 0;

	// Para la Fila
	gcuentaniveles[nivel] = 1;
	data.ix.push(fila.index);
	if (fila.level == MAXIMONIVEL) {
		data.maxnivel.push(fila.parent.index);
	}

	if (fila.children) {
		data.hijos.push(fila.children.length);
	}

	if (fila.level > 0) {
		data.padre.push(fila.parent.index, nivel);
	} else {
		data.padre.push(1);
	}
	if (grid.rows.length - 1 == fila.index) {
		return;
	}
	if (fila.children === undefined) {
		return;
	}
	// Para sus hijos
	fila.children.forEach(function (hijo) {
		if (!gcuentaniveles[hijo.level]) {
			gcuentaniveles[hijo.level] = 0;
		}
		gcuentaniveles[hijo.level] += 1;
		data.padre.push(hijo.parent.index);
		n = data.ix.push(hijo.index);
		n -= 1; //Ajustamos indice de array Data
		if (hijo.children) {
			data.hijos.push(hijo.children.length);
			// Tengo hijos de Nivel 4
			for (var i = 0; i < hijo.children.length; i++) {
				if (hijo.children[i].level == MAXIMONIVEL) {
					if (!data.maxnivel[n]) {
						data.maxnivel[n] = 0;
					}
					data.maxnivel[n] = data.maxnivel[n] + 1;
				}
			}
		}
		// El MAXIMONIVEL NO TIENE HIJOS
		if (hijo.level == MAXIMONIVEL) {
			data.maxnivel[n] = 1;
		}
	});
};

// Operaciones con Children Columna => Ene ..Dic
var operarhijos = async function (fila, columna, ltotalanterior, ltotalnuevo) {
	var ltotal = 0;
	var lvalor = 0;
	var lanterior = 0;

	const unitario = redondea(
		parseFloat(ltotalnuevo) / parseFloat(gcuentaniveles[MAXIMONIVEL])
	);
	grid.setCellValue(fila.id, columna, redondea(parseFloat(ltotalnuevo)));
	if (fila.children === undefined) {
		return;
	}
	fila.children.forEach(function (hijos) {
		var ftotal = 0;
		if (ltotalanterior == 0) {
			lvalor =
				parseFloat(unitario) *
				data.maxnivel[data.ix.indexOf(hijos.index)];
		} else {
			lanterior = parseFloat(grid.getCellValue(hijos.id, columna));
			lvalor =
				(parseFloat(grid.getCellValue(hijos.id, columna)) /
					parseFloat(ltotalanterior)) *
				parseFloat(ltotalnuevo);
		}
		ltotal =
			parseFloat(grid.getCellValue(hijos.id, COLUMNAS[0])) +
			parseFloat(lvalor) -
			parseFloat(lanterior);
		grid.setCellValue(hijos.id, columna, redondea(parseFloat(lvalor)));
		grid.setCellValue(hijos.id, COLUMNAS[0], redondea(parseFloat(ltotal)));
		// grid.checkRow(hijos.id);
	});
};
// Operaciones con Children Columna Total
var operarhijostotal = async function (fila, ltotalanterior, ltotalnuevo) {
	var ltotal = 0;
	var lvalor = 0;
	var resto = 0;

	if (fila.children === undefined) {
		return;
	}
	const unitario = redondea(
		parseFloat(ltotalnuevo) / parseFloat(gcuentaniveles[MAXIMONIVEL])
	);

	fila.children.forEach(function (hijos) {
		if (ltotalanterior == 0) {
			ltotal =
				parseFloat(unitario) *
				data.maxnivel[data.ix.indexOf(hijos.index)];
		}
		var ftotal = 0;
		for (var i = 1; i <= 12; i++) {
			if (ltotalanterior == 0) {
				if (pi.checked) {
					lvalor = redondea(parseFloat(ltotal / 12));
				} else {
					lvalor = redondea(
						parseFloat(
							(ltotal *
								parseFloat(
									Tgrid.getCellValue(2, COLUMNAS[i])
								)) /
								100
						)
					);
				}
			} else {
				if (pi.checked) {
					ltotal = redondea(
						(parseFloat(grid.getCellValue(hijos.id, COLUMNAS[0])) /
							parseFloat(ltotalanterior)) *
							parseFloat(ltotalnuevo)
					);
					lvalor = redondea(
						(parseFloat(grid.getCellValue(hijos.id, COLUMNAS[i])) /
							parseFloat(ltotalanterior)) *
							parseFloat(ltotalnuevo)
					);
				} else {
					ltotal = redondea(
						(parseFloat(grid.getCellValue(hijos.id, COLUMNAS[0])) /
							parseFloat(ltotalanterior)) *
							parseFloat(ltotalnuevo)
					);
					lvalor = redondea(
						parseFloat(
							(lvalor *
								parseFloat(
									Tgrid.getCellValue(4, COLUMNAS[i])
								)) /
								100
						)
					);
				}
			}
			grid.setCellValue(
				hijos.id,
				COLUMNAS[i],
				redondea(parseFloat(lvalor))
			);
			ftotal += parseFloat(lvalor);
		}

		//resto = resto - ftotal;
		resto = parseFloat(ltotal) - redondea(ftotal);
		lvalor += resto;
		ftotal += resto;
		grid.setCellValue(hijos.id, COLUMNAS[12], redondea(lvalor));
		grid.setCellValue(hijos.id, COLUMNAS[0], redondea(ltotal));
	});
};
// Operaciones de reparto
var operarpadres = async function (fila, columna, ltotalanterior, ltotalnuevo) {
	var ltotal = 0;
	var lvalor = 0;
	var mivalor = 0;
	var mivaloranterior = 0;

	grid.expandRow(fila.id);
	// grid.checkRow(fila.id);

	//Si No suma padres y es total Gral Level = = salimos

	if (!sumapadres.checkStatus && fila.level <= bloqueonivel) {
		return;
	}

	if (columna != "Tot") {
		// Actualizamos el mes correspondiente
		const mes = COLUMNAS.findIndex((meses) => meses === columna);
		lvalor =
			parseFloat(grid.getCellValue(fila.id, COLUMNAS[mes])) -
			parseFloat(ltotalanterior) +
			parseFloat(ltotalnuevo);

		grid.setCellValue(fila.id, columna, redondea(lvalor));
		ltotal =
			parseFloat(grid.getCellValue(fila.id, COLUMNAS[0])) -
			parseFloat(ltotalanterior) +
			parseFloat(ltotalnuevo);
	} else {
		// Si es columna de total actualizamos los meses
		for (var i = 1; i <= 12; i++) {
			lvalor =
				parseFloat(grid.getCellValue(fila.id, COLUMNAS[i])) +
				parseFloat(mifilaanterior[i]);
			grid.setCellValue(fila.id, COLUMNAS[i], redondea(lvalor));
		}
		ltotal =
			parseFloat(grid.getCellValue(fila.id, COLUMNAS[0])) +
			parseFloat(mifilaanterior[0]);
	}
	grid.setCellValue(fila.id, COLUMNAS[0], redondea(ltotal));

	if (fila.parent != undefined) {
		// Si tiene más padres
		await operarpadres(fila.parent, columna, ltotalanterior, ltotalnuevo);
	}
};

// Funcion que realiza el calculo de hijos y padres del Grid
// Calculattion Childrens and Parents in the Grid
var operar = async function (ltotalanterior, ltotalnuevo, fila, columna) {
	var ltotal = 0;
	var lvalor = 0;
	var resto = 0;
	var reg = {
		mifila: {},
		columna: "",
		ltotalanterior: 0.0,
		ltotalnuevo: 0.0,
	};

	grid.beginUpdate();

	grid.setCellValue(fila.id, columna, redondea(ltotalnuevo));
	grid.collapseAllRows();
	// Abrimo arbol  y Contamos Niveles
	// grid.checkRow(fila.id);
	abrirarbol(fila, false, false);
	gcuentaniveles = [];
	data.ix = [];
	data.padre = [];
	data.hijos = [];
	data.maxnivel = [];
	console.log("Operar", fila.id, columna);
	if (mifilaanterior.length == 0) {
		for (var f = 0; f <= 12; f++) {
			mifilaanterior.push(parseFloat(0.0));
			midiferencia.push(parseFloat(0.0));
		}
	}

	contarniveles(fila);
	if (columna == "Tot") {
		// Guardamos la diferencia de los totales en el elemento 0 de la lista
		mifilaanterior[0] = redondea(
			-parseFloat(ltotalanterior) + parseFloat(ltotalnuevo)
		);
		if (!sumapadres.checkStatus && fila.level > bloqueonivel) {
			midiferencia[0] += mifilaanterior[0];
		}

		for (var i = 1; i <= 12; i++) {
			if (ltotalanterior == 0) {
				if (pi.checked) {
					lvalor = redondea(parseFloat(ltotalnuevo / 12));
				} else {
					lvalor = parseFloat(
						(ltotalnuevo *
							redondea(
								parseFloat(Tgrid.getCellValue(2, COLUMNAS[i]))
							)) /
							100
					);
				}
			} else {
				if (pi.checked) {
					lvalor = redondea(
						parseFloat(
							(grid.getCellValue(fila.id, COLUMNAS[i]) /
								ltotalanterior) *
								ltotalnuevo
						)
					);
				} else {
					lvalor = redondea(
						parseFloat(
							(ltotalnuevo *
								parseFloat(
									Tgrid.getCellValue(4, COLUMNAS[i])
								)) /
								100
						)
					);
				}
			}
			mifilaanterior[i] = redondea(
				parseFloat(lvalor) -
					parseFloat(grid.getCellValue(fila.id, COLUMNAS[i]))
			);
			if (!sumapadres.checkStatus && fila.level > bloqueonivel) {
				midiferencia[i] += mifilaanterior[i];
			}
			grid.setCellValue(fila.id, COLUMNAS[i], lvalor);
			ltotal += parseFloat(lvalor);
			//resto += parseFloat(lvalor) - redondea(lvalor);
		}
		// Ajustamos Resto en la ultima columna
		resto = redondea(ltotalnuevo - redondea(ltotal, 2), 2);
		if (resto > 0) {
			lvalor -= resto;
			//ftotal -= resto;
		} else {
			lvalor += resto;
			//ftotal += resto;
		}

		if (ltotalanterior == 0) {
			mifilaanterior[12] = lvalor;

			if (!sumapadres.checkStatus && fila.level > bloqueonivel) {
				midiferencia[12] += lvalor;
			}
		}

		grid.setCellValue(fila.id, COLUMNAS[12], redondea(lvalor));

		await operarhijostotal(fila, ltotalanterior, ltotalnuevo);
	} else {
		// Ajustamos el total de la fila y guardamos en el elemento 'Mes' del Array Valor Anterior
		const mes = COLUMNAS.findIndex((meses) => meses === columna);
		mifilaanterior[mes] =
			-parseFloat(ltotalanterior) + parseFloat(ltotalnuevo);
		if (!sumapadres.checkStatus && fila.level > bloqueonivel) {
			midiferencia[mes] += mifilaanterior[mes];
			midiferencia[0] += midiferencia[mes];
		}
		lvalor = redondea(
			parseFloat(grid.getCellValue(fila.id, COLUMNAS[0])) -
				parseFloat(ltotalanterior) +
				parseFloat(ltotalnuevo),
			0
		);
		grid.setCellValue(fila.id, COLUMNAS[0], redondea(lvalor));
		await operarhijos(fila, columna, ltotalanterior, ltotalnuevo);
	}

	var mifila = grid.rows[fila.index];
	if (!sumapadres.checkStatus && fila.level > bloqueonivel) {
		reg.mifila = { ...mifila.parent };
		reg.columna = columna;
		reg.ltotalanterior = ltotalanterior;
		reg.ltotalnuevo = ltotalnuevo;
		filaspdtes.push(reg);
		reg = {};
	}
	// Operamos padres con valor de fila (mifila)
	if (mifila.id > 1 && mifila.parent != undefined) {
		abrirarbol(mifila, false, true);
		await operarpadres(mifila.parent, columna, ltotalanterior, ltotalnuevo);
	}
	// if (mifila.id > 1) {
	// 	abrirarbol(mifila, false, true);
	// 	if (mifila.parent != undefined) {
	// 		await operarpadres(
	// 			mifila.parent,
	// 			columna,
	// 			ltotalanterior,
	// 			ltotalnuevo
	// 		);
	// 	}
	// }

	//Abrimos Level = 0
	grid.endUpdate();
	grid.clearFilter();
	grid.refreshView();
	grid.expandRow(1);
	//toast.closeLast();
	toast.open();
	toast.type = "success";
	toast.value = "Calculo Finalizado.";

	return filaspdtes;
};

//Redndeo a n decimales
function redondea(numero, n = 2) {
	var dec = (1 + "0".repeat(n)) * 1;

	var n = Number(Math.abs(numero) * dec).toPrecision(15);

	return (Math.round(n) / dec) * Math.sign(numero);
}
//Compara dos objetos y devuelve las claves con diferente valor
var sacaKeys = function (a, b) {
	return Object.keys(a).filter(function (key) {
		return a[key] != b[key];
	});
};
//Compara dos objetos true -> Iguales o False -> Distintos
var objCompare = (arg1, arg2) => {
	if (
		Object.prototype.toString.call(arg1) ===
		Object.prototype.toString.call(arg2)
	) {
		if (
			Object.prototype.toString.call(arg1) === "[object Object]" ||
			Object.prototype.toString.call(arg1) === "[object Array]"
		) {
			if (Object.keys(arg1).length !== Object.keys(arg2).length) {
				return false;
			}
			return Object.keys(arg1).every(function (key) {
				return objCompare(arg1[key], arg2[key], "F");
			});
		}
		return arg1 === arg2;
	}
	return false;
};

var cabecera = [
	{
		label: "Descripcion",
		dataField: "Descripcion",
		dataType: "string",
		allowEdit: false,
		width: 538,
	},
	{
		label: "Total en " + RESUMEN,
		dataField: "Tot",
		dataType: "number",
		cellsFormat: "n2",
		editor: {
			template: "numberInput",
			numberFormat: {
				style: "decimal",
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: "Ene",
		dataField: "Ene",
		align: "right",
		dataType: "number",
		cellsFormat: "n2",
		editor: {
			template: "numberInput",
			numberFormat: {
				style: "decimal",
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: "Feb",
		dataField: "Feb",
		align: "right",
		dataType: "number",
		cellsFormat: "n2",
		editor: {
			template: "numberInput",
			numberFormat: {
				style: "decimal",
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: "Mar",
		dataField: "Mar",
		align: "right",
		dataType: "number",
		cellsFormat: "n2",
		editor: {
			template: "numberInput",
			numberFormat: {
				style: "decimal",
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: "Abr",
		dataField: "Abr",
		align: "right",
		dataType: "number",
		cellsFormat: "n2",
		editor: {
			template: "numberInput",
			numberFormat: {
				style: "decimal",
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: "May",
		dataField: "May",
		align: "right",
		dataType: "number",
		cellsFormat: "n2",
		editor: {
			template: "numberInput",
			numberFormat: {
				style: "decimal",
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: "Jun",
		dataField: "Jun",
		align: "right",
		dataType: "number",
		cellsFormat: "n2",
		editor: {
			template: "numberInput",
			numberFormat: {
				style: "decimal",
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: "Jul",
		dataField: "Jul",
		align: "right",
		dataType: "number",
		cellsFormat: "n2",
		editor: {
			template: "numberInput",
			numberFormat: {
				style: "decimal",
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: "Ago",
		dataField: "Ago",
		align: "right",
		dataType: "number",
		cellsFormat: "n2",
		editor: {
			template: "numberInput",
			numberFormat: {
				style: "decimal",
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: "Sep",
		dataField: "Sep",
		align: "right",
		dataType: "number",
		cellsFormat: "n2",
		editor: {
			template: "numberInput",
			numberFormat: {
				style: "decimal",
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: "Oct",
		dataField: "Oct",
		align: "right",
		dataType: "number",
		cellsFormat: "n2",
		editor: {
			template: "numberInput",
			numberFormat: {
				style: "decimal",
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: "Nov",
		dataField: "Nov",
		align: "right",
		dataType: "number",
		cellsFormat: "n2",
		editor: {
			template: "numberInput",
			numberFormat: {
				style: "decimal",
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: "Dic",
		dataField: "Dic",
		align: "right",
		dataType: "number",
		cellsFormat: "n2",
		editor: {
			template: "numberInput",
			numberFormat: {
				style: "decimal",
				minimumFractionDigits: 2,
			},
		},
	},
];
var filas = [
	"Pk: number",
	"1: string",
	"2: string",
	"3: string",
	"4: string",
	"Descripcion: string",
	"Tot: number",
	"Ene: number",
	"Feb: number",
	"Mar: number",
	"Abr: number",
	"May: number",
	"Jun: number",
	"Jul: number",
	"Ago: number",
	"Sep: number",
	"Oct: number",
	"Nov: number",
	"Dic: number",
	"Idx: number",
	"Response: number",
	"Nivel: number",
	"Clave: string",
	"Indice: string",
];

window.Smart(
	"#grid",
	class {
		get properties() {
			return {
				sorting: {
					enabled: true,
				},
				checkBoxes: {
					visible: true,
					hasThreeStates: false,
				},
				editing: {
					batch: false,
					enabled: true,
					//action: "doubleClick",
					action: "click",
					//mode: "row",
					mode: "cell",
					commandColumn: {
						visible: true,
						dataSource: {
							commandColumnEdit: {
								visible: false,
							},
							commandColumnDelete: {
								visible: false,
							},
							commandColumnMenu: {
								visible: false,
							},
							commandColumnRowMenu: {
								visible: true,
							},
						},
					},
				},
				selection: {
					enabled: true,
					mode: "one",
					allowCellSelection: false,
				},
				behavior: { columnResizeMode: "growAndShrink" },
				layout: {
					rowHeight: "auto",
					rowMinHeight: 35,
					allowCellsWrap: true,
				},
				appearance: {
					allowRowDetailToggleAnimation: false,
					autoShowColumnFilterButton: false,
					alternationCount: 2,
				},
				header: {
					visible: false,
					buttons: [],
				},

				footer: {
					visible: true,
					template: "#footerTemplate",
				},
				columns: cabecera,
				dataSource: new window.Smart.DataAdapter({
					dataSource:
						"http://localhost:3000/objetivos/leoobjetivos/?uno=" +
						IDLAYOUT +
						"&dos=" +
						IDVERSION.value,
					dataSourceType: "json",
					keyDataField: "Idx",
					parentDataField: "Response",
					id: "Idx",
					dataFields: filas,
				}),
				onInit: function () {
					toast.open();
					toast.type = "warning";
					toast.value = "Cargando Datos de BBDD .....";
				},

				onCommand: function (args) {
					if (args.name === "commandColumnRowMenuCommand") {
						const row = args.details;
						const menu = document.getElementById("menu");
						args.event.preventDefault();
						menu.setAttribute("data-row-idx", row.index);
						menu.open(
							args.event.pageX - 150,
							args.event.pageY + 20
						);
						args.handled = true;
					}
				},
				onKey: function (event) {
					if (event.ctrlKey && event.key === "z") {
						event.stopImmediatePropagation();
						event.preventDefault();
						grid.cancelEdit();
					}
				},
				onRowInit: function (index, row) {
					if (row.id === 1) {
						toast.closeLast();
						toast.open();
						toast.type = "success";
						toast.value = "Datos Cargados con Exito .....";
						row.expanded = true;
						row.freeze = "near";
					}
				},
				// Calculo de hijos y padres del Grid
				// onRowUpdate: async function (
				// 	index,
				// 	row,
				// 	oldValues,
				// 	newValues,
				// 	confirm
				// ) {
				// 	var misvalores = [];
				// 	if (objCompare(oldValues, newValues)) {
				// 		confirm(false);
				// 	} else {
				// 		var cambios = sacaKeys(oldValues[0], newValues[0]);

				// 		if (cambios.length > 1) {
				// 			cambios.shift();
				// 			var tope = cambios.length;

				// 			if (cambios[1] == "Tot") {
				// 				tope = 1;
				// 			}
				// 			for (var i = 0; i < tope; i++) {
				// 				misvalores = await operar(
				// 					oldValues[0][cambios[i]],
				// 					newValues[0][cambios[i]],
				// 					row[0],
				// 					cambios[i]
				// 				);
				// 			}
				// 		} else {
				// 			confirm(false);
				// 		}
				// 		if (cambios[0] != 0) {
				// 			confirm(true);
				// 			calculapesos(row[0]);
				// 		}
				// 	}
				// },
				//
				// Funcion que realiza el calculo de hijos y padres del Grid
				// Calculattion Childrens and Parents in the Grid
				onCellUpdate: async function (
					cell,
					oldValue,
					newValue,
					confirm
				) {
					var misvalores = [];
					var fila = cell[0].row;
					var columna = cell[0].column.dataField;
					//Si tenemos bloque de padres los niveles superiores no se pueden tocar
					if (!sumapadres.checkStatus && fila.level <= bloqueonivel) {
						confirm(false);
					} else if (oldValue == newValue) {
						confirm(false);
					} else if (!cell[0].row.checked) {
						misvalores = await operar(
							oldValue,
							newValue,
							fila,
							columna
						);
						confirm(true);
						calculapesos(fila);
					} else {
						confirm(false);
					}
				},
			};
		}
	}
);

grid.addEventListener("beginEdit", function (event) {
	const detail = event.detail,
		row = detail.row,
		originalEvent = detail.originalEvent,
		id = detail.id,
		isRightClick = detail.isRightClick,
		pageX = detail.pageX,
		pageY = detail.pageY;
});
grid.addEventListener("rowClick", function (event) {
	const detail = event.detail,
		row = detail.row,
		originalEvent = detail.originalEvent,
		id = detail.id,
		isRightClick = detail.isRightClick,
		pageX = detail.pageX,
		pageY = detail.pageY;
	event.preventDefault();

	FILA_INDEX = row.index;

	calculapesos(row);
	//grid.refreshView();
	iconoGgrid = "fas fa-sort-amount-down-alt";

	// grid.columns[0].label = "Fernando Pellús";
}),
	grid.addEventListener("rowExpand", function (event) {
		const detail = event.detail,
			erow = detail.row,
			eid = detail.id,
			eoriginalEvent = detail.originalEvent;
		//event.preventDefault();
		grid.setRowStyle(erow.id, {
			fontFamily: "Poppins",
			fontWeight: 600,
			background: "default",
			color: "default",
		});
		if (erow.id > 1) {
			abrirarbol(erow, false, true);
		}
	}),
	grid.addEventListener("rowCollapse", function (event) {
		const detail = event.detail,
			erow = detail.row,
			eid = detail.id,
			eoriginalEvent = detail.originalEvent;

		grid.setRowStyle(erow.id, {
			fontFamily: "Poppins",
			fontWeight: "default",
			background: "default",
			color: "default",
		});
	}),
	menu.addEventListener("itemClick", function (event) {
		const rowIdx = parseInt(menu.getAttribute("data-row-idx"));
		var mrow = grid.rows[rowIdx];
		if (mrow) {
			event.detail.item.getAttribute("data-id");
			// Recuperamos los valores del Grid por Ajax
			if (event.detail.item.getAttribute("data-id") === "Recalcular") {
				grid.dataSource = new window.Smart.DataAdapter({
					dataSource:
						"http://localhost:3000/objetivos/leoobjetivos/?uno=" +
						IDLAYOUT +
						"&dos=" +
						IDVERSION.value,
					dataSourceType: "json",
					keyDataField: "Idx",
					parentDataField: "Response",
					id: "Idx",
					dataFields: filas,
				});
			}
			// Colapsamos todos los elementos del mismo nivel a su padre
			if (event.detail.item.getAttribute("data-id") === "Colapsar") {
				grid.beginUpdate();
				//event.preventDefault();
				var indice = parseInt(mrow.index);
				var mifila = { ...grid.rows[indice] };
				//grid.collapseRow(mifila.id);
				while (mifila.level > 0) {
					if (mifila.level > mrow.level) {
						grid.setRowStyle(mifila.id, {
							fontFamily: "Poppins",
							fontWeight: "default",
							background: "default",
							color: "default",
						});
					}

					indice -= 1;
					mifila = { ...grid.rows[indice] };
				}

				//grid.collapseRow(mifila.id);
				mifila.children.forEach((hijo) => {
					if (hijo.level >= mrow.level) {
						grid.collapseRow(hijo.id);
						grid.setRowStyle(hijo.id, {
							fontFamily: "Poppins",
							fontWeight: "default",
							background: "default",
							color: "default",
						});
					}
				});

				grid.collapseRow(mrow.id);
				if (mrow.level > 0) {
					grid.setRowStyle(mrow.id, {
						fontFamily: "Poppins",
						fontWeight: "default",
						background: "default",
						color: "default",
					});
				}
				grid.endUpdate();
				grid.refreshView();
			}
			// Expandimos todos los hijos de un nivel
			if (event.detail.item.getAttribute("data-id") === "Expandir") {
				grid.beginUpdate();
				var indice = parseInt(mrow.index);
				var mifila = grid.rows[indice];
				var nivel = mifila.level;
				event.preventDefault();
				if (nivel == 0) {
					nivel = MAXIMONIVEL;
				} else {
					nivel += 1;
				}
				//grid.expandRowsToGroupLevel(nivel);
				abrirarbol(mifila, true, true);
				grid.endUpdate();
			}
		}
	});

export {
	operar,
	calculapesos,
	abrirarbol,
	changeIcono,
	objCompare,
	sacaKeys,
	FILA_INDEX,
	sumapadres,
	bloqueonivel,
};
