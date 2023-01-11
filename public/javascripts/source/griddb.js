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
	"#236D9E",
	"#802A00",
	"#B20057",
	"#007D06",
	"#9124F0",
];
const slider = document.getElementById("slider");
const texto = document.getElementById("slidertxt");
const mensaje = document.getElementById("mensaje");
const updateBtn = document.getElementById("updateBtn");
const toast = document.querySelectorAll("smart-toast")[0];
var porcentaje = 0;
var FILA_INDEX = 0;
var IDVERSIONANTERIOR = "";
var mifilaanterior = [];
var midiferencia = [];
$("#idempresa").attr("disabled", "disable");
function changeIcono(indice) {
	return iconoGgrid;
}

slider.addEventListener("change", function (event) {
	const value = event.detail.value;
	texto.innerText = "Limite: " + parseInt(value) + " %";
	porcentaje = parseInt(value);
	if (pi.checked) {
		cambiartipopeso("i");
	} else {
		cambiartipopeso("t");
	}
	calculapesos(grid.rows[FILA_INDEX], "");
});

pt.addEventListener("change", function (event) {
	if (porcentaje > 0) {
		tabs.update(
			1,
			'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Compañía <span class="smart-badge smart-badge-danger smart-badge-pill">' +
				porcentaje +
				" % Limite</span>"
		);
	} else {
		tabs.update(
			1,
			'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Compañía'
		);
	}
});
pi.addEventListener("change", function (event) {
	if (porcentaje > 0) {
		tabs.update(
			1,
			'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Indivdual <span class="smart-badge smart-badge-danger smart-badge-pill">' +
				porcentaje +
				" % Limite</span>"
		);
	} else {
		tabs.update(
			1,
			'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Indivdual'
		);
	}
});
$("#idversion").on("change", function (event) {
	if ($("#idversion").val() != $("#version").val()) {
		$("#updateBtn").removeClass("primary").addClass("error");
	} else {
		// updateBtn.innerHTML = '<span> <i class="fas fa-save" aria-hidden="true"></i> Guardar </span>';
		$("#updateBtn").removeClass("error").addClass("primary");
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
		toast.closeLast();
		toast.open();
		toast.type = "error";
		toast.value = "No puede grabar existen diferencias de reparto .....";
		Ggrid.setRowStyle(5, { background: "red", color: "white" });

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

	toast.closeLast();
	toast.open();
	toast.type = "warning";
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
		if (porcentaje > 0) {
			tabs.update(
				1,
				'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Compañía <span class="smart-badge smart-badge-danger smart-badge-pill">' +
					porcentaje +
					" % Limite</span>"
			);
		} else {
			tabs.update(
				1,
				'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Compañía'
			);
		}
	}
	if (tipo == "i") {
		if (porcentaje > 0) {
			tabs.update(
				1,
				'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Indivdual <span class="smart-badge smart-badge-danger smart-badge-pill">' +
					porcentaje +
					" % Limite</span>"
			);
		} else {
			tabs.update(
				1,
				'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Indivdual'
			);
		}
	}
};
//Compara dos objetos (Claves y Valores) y devuelve si son iguales o no
var objCompare = (a, b) => {
	if (
		Object.prototype.toString.call(a) === Object.prototype.toString.call(b)
	) {
		if (
			Object.prototype.toString.call(a) === "[object Object]" ||
			Object.prototype.toString.call(a) === "[object Array]"
		) {
			if (Object.keys(a).length !== Object.keys(b).length) {
				return false;
			}
			return Object.keys(a).every(function (key) {
				return objCompare(a[key], b[key], "F");
			});
		}
		return a === b;
	}
	return false;
};

//Compara dos objetos y devuelve las claves con diferente valor
var sacaKeys = function (a, b) {
	return Object.keys(a).filter(function (key) {
		return a[key] != b[key];
	});
};
var calculapesos = function (fila, modo) {
	var peso = 0;
	var gpeso = 0;
	var gtpeso = 0;
	var diferencia = 0;
	var padre = 0;

	if (!fila.parentId) {
		padre = 1;
	} else {
		padre = fila.parentId;
	}

	Ggrid.setRowStyle(5, { background: "default", color: "default" });
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
				parseFloat(gpeso) > parseFloat(porcentaje) &&
				parseFloat(porcentaje) != 0
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
				parseFloat(peso) > parseFloat(porcentaje) &&
				i > 0 &&
				parseFloat(porcentaje) != 0
			) {
				Ggrid.rows[3].cells[i + 1].background = "red";
				Ggrid.rows[3].cells[i + 1].color = "white";
			} else {
				Ggrid.rows[3].cells[i + 1].background =
					COLORES_FONDO[fila.level];
				Ggrid.rows[3].cells[i + 1].color = "default";
			}
		}
		gtpeso = redondea((gtpeso += parseFloat(gpeso)));
		// diferencia = parseFloat(grid.getCellValue(1,COLUMNAS[i]))-parseFloat(Ggrid.getCellValue(1,COLUMNAS[i]));
		Ggrid.setCellValue(
			2,
			COLUMNAS[i],
			redondea(
				grid.getCellValue(1, COLUMNAS[i]) -
					Ggrid.getCellValue(1, COLUMNAS[i])
			)
		);

		Ggrid.setCellValue(3, COLUMNAS[i], redondea(parseFloat(gpeso)));
		Ggrid.setCellValue(4, COLUMNAS[i], redondea(parseFloat(peso)));
		// Tabla TGrid Totales Cia
		Tgrid.setCellValue(3, COLUMNAS[i], grid.getCellValue(1, COLUMNAS[i]));
		Tgrid.setRowStyle(3, { background: "default", color: "#1cabe9" });

		Tgrid.setCellValue(
			4,
			COLUMNAS[i],
			redondea(
				parseFloat(
					(grid.getCellValue(1, COLUMNAS[i]) /
						grid.getCellValue(1, COLUMNAS[0])) *
						100
				)
			)
		);
		// Si la variacon viene por peso modo = '%', OJO no acumulamos al Total General. Acumulamos diferencia para ajustar al final
		var vanterior = parseFloat(0.0);

		if (modo == "%") {
			if (mifilaanterior.length > 0) {
				/* 				vanterior =
					parseFloat(Ggrid.getCellValue(5, COLUMNAS[i])).toFixed(2) *
					1; */

				Ggrid.setCellValue(
					5,
					COLUMNAS[i],
					redondea(parseFloat(vanterior - mifilaanterior[i]))
				);
				if (i > 0) {
					totaldiferencia += redondea(
						parseFloat(Ggrid.getCellValue(5, COLUMNAS[i]))
					);
				}
				Ggrid.setCellValue(
					5,
					COLUMNAS[0],
					redondea(parseFloat(totaldiferencia))
				);
			}
		} else if (modo == "A") {
			totaldiferencia = 0.0;
			Ggrid.setCellValue(5, COLUMNAS[i], redondea(parseFloat(0.0)));
		}
	}
	Tgrid.setRowStyle(4, { background: "default", color: "#1cabe9" });

	diferencia = redondea(
		parseFloat(grid.getCellValue(1, COLUMNAS[0])) -
			parseFloat(Ggrid.getCellValue(1, COLUMNAS[0]))
	);

	if (diferencia < 0) {
		Ggrid.setRowStyle(2, { background: "default", color: "red" });
		Tgrid.setRowStyle(3, { background: "default", color: "red" });
		Tgrid.setRowStyle(4, { background: "default", color: "red" });
	} else if (diferencia > 0) {
		Ggrid.setRowStyle(2, { background: "default", color: "#1cabe9" });
		Tgrid.setRowStyle(3, { background: "default", color: "#1cabe9" });
		Tgrid.setRowStyle(4, { background: "default", color: "#1cabe9" });
	} else {
		Ggrid.setRowStyle(2, { background: "default", color: "black" });
		Tgrid.setRowStyle(3, { background: "default", color: "black" });
		Tgrid.setRowStyle(4, { background: "default", color: "black" });
	}

	Ggrid.setCellValue(3, "Idx", parseFloat(fila.index));
	Ggrid.setCellValue(4, "Idx", parseFloat(fila.index));

	Ggrid.endUpdate();
	Ggrid.refreshView();

	return;
};
//Abrimos el arbol a partir de la fila, indicada, todos sus hijos (true / false) y color
var abrirarbol = function (fila, all, color) {
	grid.beginUpdate();
	grid.expandRow(fila.id);

	grid.setRowStyle(fila.id, {
		background: COLORES_FONDO[fila.level],
		color: COLORES_LETRA[fila.level],
	});
	fila.children.forEach((hijo) => {
		if (color) {
			grid.setRowStyle(hijo.id, {
				background: COLORES_FONDO[hijo.level],
				color: COLORES_LETRA[hijo.level],
			});
		}
		if (hijo.children.length > 0 && all) {
			abrirarbol(hijo, true, color);
		}
	});
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

// Operaciones con Children Columna <> Ene ..Dic
var operarhijos = function (fila, columna, ltotalanterior, ltotalnuevo) {
	var ltotal = 0;
	var lvalor = 0;
	var lanterior = 0;

	const unitario = redondea(
		parseFloat(ltotalnuevo) / parseFloat(gcuentaniveles[MAXIMONIVEL])
	);
	grid.setCellValue(fila.id, columna, redondea(parseFloat(ltotalnuevo)));

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
var operarhijostotal = function (fila, ltotalanterior, ltotalnuevo) {
	var ltotal = 0;
	var lvalor = 0;
	var resto = 0;

	// Set a Float la celda modificada
	//grid.setCellValue(fila.id, COLUMNAS[0], redondea(parseFloat(ltotalnuevo)));
	const unitario =
		parseFloat(ltotalnuevo) / parseFloat(gcuentaniveles[MAXIMONIVEL]);

	fila.children.forEach(function (hijos) {
		var ftotal = 0;
		if (ltotalanterior == 0) {
			ltotal =
				parseFloat(unitario) *
				data.maxnivel[data.ix.indexOf(hijos.index)];
		}
		for (var i = 1; i <= 12; i++) {
			if (ltotalanterior == 0) {
				if (pi.checked) {
					lvalor = parseFloat(ltotal / 12);
				} else {
					lvalor = parseFloat(
						(ltotal *
							parseFloat(Tgrid.getCellValue(2, COLUMNAS[i]))) /
							100
					);
				}
			} else {
				if (pi.checked) {
					lvalor =
						(parseFloat(grid.getCellValue(hijos.id, COLUMNAS[i])) /
							parseFloat(ltotalanterior)) *
						parseFloat(ltotalnuevo);
				} else {
					lvalor =
						(parseFloat(grid.getCellValue(hijos.id, COLUMNAS[0])) /
							parseFloat(ltotalanterior)) *
						parseFloat(ltotalnuevo);
					lvalor = parseFloat(
						(lvalor *
							parseFloat(Tgrid.getCellValue(4, COLUMNAS[i]))) /
							100
					);
				}
			}
			grid.setCellValue(
				hijos.id,
				COLUMNAS[i],
				redondea(parseFloat(lvalor))
			);
			ftotal += parseFloat(lvalor);
			resto += parseFloat(lvalor) - redondea(lvalor);
		}

		//resto = resto - ftotal;
		console.log(hijos.data.Descripcion, hijos.level, ftotal, resto);
		if (resto < 0) {
			lvalor -= resto;
			//ftotal -= resto;
		} else {
			lvalor += resto;
			//ftotal += resto;
		}

		grid.setCellValue(hijos.id, COLUMNAS[12], redondea(lvalor));
		resto = 0;
		grid.setCellValue(hijos.id, COLUMNAS[0], redondea(ftotal));
		//} else {

		// console.log("Resto a Total Mes 12", resto);
		// grid.setCellValue(
		// 	hijos.id,
		// 	COLUMNAS[0],
		// 	parseFloat(ftotal).toFixed(2)
		// );
		//}
		// grid.checkRow(hijos.id);
	});
};
// Operaciones con Children Columna <> Ene ..Dic
var operarpadres = function (fila, columna, ltotalanterior, ltotalnuevo, modo) {
	var ltotal = 0;
	var lvalor = 0;
	var mivalor = 0;
	var mivaloranterior = 0;

	grid.expandRow(fila.id);
	// grid.checkRow(fila.id);

	//Si es el Total General level = 0 y el modo = '%' (Grupo)  no acumulamnos. Dejamos la diferencia a repartir
	if (fila.level == 0 && modo == "%") {
		return;
	}

	if (columna != "Tot") {
		// Actualizamos el mes correspondiente
		const mes = COLUMNAS.findIndex((meses) => meses === columna);
		lvalor =
			parseFloat(grid.getCellValue(fila.id, COLUMNAS[mes])) -
			parseFloat(ltotalanterior) +
			parseFloat(ltotalnuevo);

		grid.setCellValue(fila.id, columna, redondea(parseFloat(lvalor)));
		ltotal =
			parseFloat(grid.getCellValue(fila.id, COLUMNAS[0])) -
			parseFloat(ltotalanterior) +
			parseFloat(ltotalnuevo);
	} else {
		// Si es columna de total actualizamos los meses de los padres
		for (var i = 1; i <= 12; i++) {
			lvalor =
				parseFloat(grid.getCellValue(fila.id, COLUMNAS[i])) +
				parseFloat(mifilaanterior[i]);
			grid.setCellValue(
				fila.id,
				COLUMNAS[i],
				redondea(parseFloat(lvalor))
			);
		}
		ltotal =
			parseFloat(grid.getCellValue(fila.id, COLUMNAS[0])) +
			parseFloat(mifilaanterior[0]);
	}
	grid.setCellValue(fila.id, COLUMNAS[0], redondea(parseFloat(ltotal)));

	if (fila.parent != undefined) {
		// Si tiene más padres
		operarpadres(fila.parent, columna, ltotalanterior, ltotalnuevo, modo);
	}
	console.log("Fila Anterior y Diferencia", mifilaanterior, midiferencia);
};
var operar = function (ltotalanterior, ltotalnuevo, fila, columna, modo) {
	var ltotal = 0;
	var lvalor = 0;
	var resto = 0;
	grid.beginUpdate();

	// Set de la celda a ParseFloat
	grid.setCellValue(fila.id, columna, redondea(parseFloat(ltotalnuevo)));
	grid.collapseAllRows();
	// Abrimo arbol  y Contamos Niveles
	// grid.checkRow(fila.id);
	abrirarbol(fila, false, false);
	gcuentaniveles = [];
	data.ix = [];
	data.padre = [];
	data.hijos = [];
	data.maxnivel = [];

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
		if (modo == "%") {
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
			if (modo == "%") {
				midiferencia[i] += mifilaanterior[i];
			}
			grid.setCellValue(
				fila.id,
				COLUMNAS[i],
				redondea(parseFloat(lvalor))
			);
			ltotal += parseFloat(lvalor);
			resto += parseFloat(lvalor) - redondea(lvalor);
		}
		// Ajustamos Resto en la ultima columna
		if (resto < 0) {
			lvalor -= resto;
			//ftotal -= resto;
		} else {
			lvalor += resto;
			//ftotal += resto;
		}
		if (ltotalanterior == 0) {
			mifilaanterior[12] = redondea(
				parseFloat(lvalor) -
					parseFloat(grid.getCellValue(fila.id, COLUMNAS[i]))
			);
			if (modo == "%") {
				midiferencia[i] += mifilaanterior[i];
			}
		}
		grid.setCellValue(fila.id, COLUMNAS[12], redondea(parseFloat(lvalor)));
		operarhijostotal(fila, ltotalanterior, ltotalnuevo);
	} else {
		// Ajustamos el total de la fila y guardamos en el elemento 'Mes' del Array Valor Anterior
		const mes = COLUMNAS.findIndex((meses) => meses === columna);
		mifilaanterior[mes] = parseFloat(ltotalanterior);
		if (modo == "%") {
			midiferencia[mes] += mifilaanterior[mes];
		}
		lvalor = redondea(
			parseFloat(grid.getCellValue(fila.id, COLUMNAS[0])) -
				parseFloat(ltotalanterior) +
				parseFloat(ltotalnuevo)
		);
		grid.setCellValue(fila.id, COLUMNAS[0], redondea(parseFloat(lvalor)));
		operarhijos(fila, columna, ltotalanterior, ltotalnuevo);
	}

	// Operamos padres con valor de fila (mifila) y el Array de valores anteriores (mifilaanterior) con las diferencias
	var mifila = grid.rows[fila.index];

	if (mifila.id > 1) {
		abrirarbol(mifila, false, true);
		if (mifila.parent != undefined) {
			operarpadres(
				mifila.parent,
				columna,
				ltotalanterior,
				ltotalnuevo,
				mifilaanterior,
				modo
			);
		}
	}

	//Abrimos Level = 0
	grid.endUpdate();
	grid.expandRow(1);

	toast.closeLast();
	toast.open();
	toast.type = "success";
	toast.value = "Calculo Finalizado.";
};

//Redndeo a 2 decimales
function redondea(numero) {
	var n = Number(Math.abs(numero) * 1000).toPrecision(15);
	return (Math.round(n) / 1000) * Math.sign(numero);
}

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

var plantilla = "<strong>Valores Originales</strong>";
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
					action: "click",
					mode: "row",
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
					mode: "extended",
					allowCellSelection: false,
				},
				behavior: { columnResizeMode: "growAndShrink" },
				layout: {
					rowHeight: "auto",
					rowMinHeight: 40,
					allowCellsWrap: true,
				},
				appearance: {
					allowRowDetailToggleAnimation: false,
					autoShowColumnFilterButton: false,
					alternationCount: 2,
				},
				header: {
					visible: true,
					buttons: ["search"],
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
				// onKey: function(event){
				//   var rows = grid.getSelectedRows();
				//   var id = parseInt(rows[0][0]) + 1;

				// },
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
				// onRowUpdate: function (
				// 	index,
				// 	row,
				// 	oldValues,
				// 	newValues,
				// 	confirm
				// ) {
				// 	var cambios = sacaKeys(oldValues, newValues);
				// 	cambios.forEach((c) => {
				// 		if (c != "Descripcion") {
				// 			console.log(c, oldValues[c], newValues[c]);
				// 		}
				// 	});
				// 	confirm(true);
				// },
				onCellUpdate: function (cell, oldValue, newValue, confirm) {
					var fila = cell[0].row;
					var columna = cell[0].column.dataField;
					if (oldValue == newValue) {
						confirm(false);
					} else if (!cell[0].row.checked) {
						operar(oldValue, newValue, fila, columna, "A");
						confirm(true);
						calculapesos(fila, "A");
					} else {
						confirm(false);
					}
				},
			};
		}
	}
);
$("#probar")
	.css("width", "0%")
	.attr("aria-valuenow", 0)
	.text("Datos Cargados ....");
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
	//event.preventDefault();
	toast.closeLast();
	FILA_INDEX = row.index;
	Ggrid.editing.enabled = true;
	calculapesos(row, "");
	grid.refreshView();
	iconoGgrid = "fas fa-sort-amount-down-alt";

	// grid.columns[0].label = "Fernando Pellús";
}),
	// grid.addEventListener('change', function (event) {
	//   const detail = event.detail,
	//       started = detail.started,
	//       finished = detail.finished,
	//       originalEvent = detail.originalEvent;
	//       event.preventDefault();
	//       var filaid = "";
	//       var filas = grid.getSelectedRows();
	//       if (filas.length > 0) {
	//            filaid = filas[0][0];

	//            calculapesos(grid.rows[filaid]);
	//       } else {
	//            grid.selectRows([1]);
	//            filas = grid.getSelectedRows();
	//            calculapesos(filas[0]);

	//       }

	//     }),
	grid.addEventListener("rowExpand", function (event) {
		const detail = event.detail,
			erow = detail.row,
			eid = detail.id,
			eoriginalEvent = detail.originalEvent;
		event.preventDefault();
		grid.setRowStyle(erow.id, {
			background: COLORES_FONDO[erow.level],
			color: COLORES_LETRA[erow.level],
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
		event.preventDefault();
		if (erow.level == 1) {
			grid.setRowStyle(erow.id, {
				background: "default",
				color: "default",
			});
		}

		//grid.setRowStyle(erow.id,{"background":COLORES_FONDO[erow.level],"color":"default"});
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
				event.preventDefault();
				var indice = parseInt(mrow.index);
				var mifila = grid.rows[indice];
				while (mifila.level > 0) {
					indice -= 1;
					mifila = grid.rows[indice];
				}
				mifila.children.forEach((hijo) => {
					if (
						hijo.level == mrow.level ||
						hijo.level == mrow.level - 1
					) {
						grid.collapseRow(hijo.id);
						grid.setRowStyle(hijo.id, {
							background: COLORES_FONDO[0],
							color: COLORES_LETRA[0],
						});
					}
				});
				grid.collapseRow(mrow.id);
				if (mrow.level == 2) {
					grid.setRowStyle(mrow.parentId, {
						background: COLORES_FONDO[0],
						color: COLORES_LETRA[0],
					});
				}
				grid.endUpdate();
			}
			// Expandimos todos los hijos de un nivel
			if (event.detail.item.getAttribute("data-id") === "Expandir") {
				grid.beginUpdate();
				var indice = parseInt(mrow.index);
				var mifila = grid.rows[indice];
				event.preventDefault();
				abrirarbol(mifila, true, true);
				grid.endUpdate();
			}
		}
	});

export { operar, calculapesos, abrirarbol, changeIcono };
