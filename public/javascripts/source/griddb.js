window.addEventListener('keydown', function (event) {
	if (event.ctrlKey && event.key === 'z') {
		alert('Control Z');
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
const RESUMEN = document.getElementById('resumen').value;
const MAXIMONIVEL = document.getElementById('maxnivel').value;
const IDLAYOUT = document.getElementById('idlayout').value;
const IDVERSION = document.getElementById('idversion');
const VERSIONANTERIOR = document.getElementById('version').value;
const resumenlayout = document.getElementById('resumenlayout');
const distribucion = document.getElementById('distable');
const mensaje = document.getElementById('mensaje');
const updateBtn = document.getElementById('updateBtn');
const exportBtn = document.getElementById('exportBtn');
//const toast = document.querySelectorAll("smart-toast")[0];
const toast = document.getElementById('avisoerror');
const infotoats = document.getElementById('infotoats');
const sumapadres = document.getElementById('bp');
const dropDownButtonSave = document.getElementById('dropDownButtonSave');
const dropDownButtonExp = document.getElementById('dropDownButtonExport');
const grid = document.getElementById('grid');
const COLUMNAS = [
	'Tot',
	'Ene',
	'Feb',
	'Mar',
	'Abr',
	'May',
	'Jun',
	'Jul',
	'Ago',
	'Sep',
	'Oct',
	'Nov',
	'Dic',
];
const COLORES_FONDO = [
	'default',
	'default',
	'default',
	'default',
	'default',
	'default',
];
const COLORES_LETRA = [
	'default',
	'purple',
	'#802A00',
	'#B20057',
	'#007D06',
	'#9124F0',
];

var bloqueonivel = 0;
var FILA_RESUMEN = 0;
var FILA_INDEX = 0;
var LAFILA = '';
var IDVERSIONANTERIOR = '';
var mifilaanterior = [
	0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
];
var midiferencia = [
	0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
];
// ID Rows pendientes de Sumar a Padres
var filaspdtes = [];
$('#idempresa').attr('disabled', 'disable');
var log = document.querySelector('#log');
sumapadres.checkStatus = true;
log.textContent = 'Suma Totales: Si';

sumapadres.addEventListener('change', async function (event) {
	const checkStatus = event.detail.value;
	var texto = '';
	bloqueonivel = 0;
	if (checkStatus === true) {
		log.textContent = 'Suma Totales: Si';
		sumapadres.checkStatus = true;
		$(log).addClass('text-bg-success');
		$(log).removeClass('text-bg-danger');
		resumenlayout.refreshView();
		texto =
			'<a href="#"><span class="smart-badge smart-badge-success smart-badge-pill"><i class="fas fa-calculator"></i></span></a> &nbsp Trabajo';
		changeTab(3, texto);
		infotoats.closeLast();
	} else {
		log.textContent = 'Suma Totales: No';
		sumapadres.checkStatus = false;

		$(log).removeClass('text-bg-success');
		$(log).addClass('text-bg-danger');
		resumenlayout.refreshView();
		texto =
			'<a href="#"><span class="smart-badge smart-badge-danger smart-badge-pill"><i class="fas fa-calculator"></i></span></a> &nbsp Trabajo';
		changeTab(3, texto);
		//infotoats.closeLast();
		infotoats.itemTemplate = 'template-toast';
		infotoats.open();
	}
});
infotoats.addEventListener('open', function () {
	document
		.getElementById('closeButton')
		.addEventListener('click', function () {
			infotoats.closeLast();
		});
});
function changeTab(ntab, texto) {
	tabs.update(ntab, texto);
}
function changeIcono() {
	return '';
}

pt.addEventListener('change', function (event) {
	var texto = '';
	if (bloqueonivel > 0) {
		texto =
			'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Compa????a <span class="smart-badge smart-badge-danger smart-badge-pill">' +
			bloqueonivel +
			'</span>';
	} else {
		texto =
			'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Compa????a';
	}

	changeTab(1, texto);
});
pi.addEventListener('change', function (event) {
	var texto = '';
	if (bloqueonivel > 0) {
		texto =
			'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Individual <span class="smart-badge smart-badge-danger smart-badge-pill">' +
			bloqueonivel +
			'%</span>';
	} else {
		texto =
			'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Individual';
	}
	changeTab(1, texto);
});
$('#idversion').on('change', function (event) {
	if ($('#idversion').val() != $('#version').val()) {
		if ($('#idversion').val() == 'V1') {
			updateBtn.innerHTML =
				'<span> <i class="fas fa-save" aria-hidden="true"></i> </span> Optimista';
			$('#updateBtn')
				.removeClass('bg-azulbaculo btn-danger btn-warning')
				.addClass('btn-success');
		} else if ($('#idversion').val() == 'V2') {
			updateBtn.innerHTML =
				'<span> <i class="fas fa-save" aria-hidden="true"></i> </span> Pesimista';
			$('#updateBtn')
				.removeClass('bg-azulbaculo btn-warning btn-success')
				.addClass('btn-danger');
		} else {
			updateBtn.innerHTML =
				'<span> <i class="fas fa-save" aria-hidden="true"></i> </span> Realista';
			$('#updateBtn')
				.removeClass('bg-azulbaculo btn-success btn-danger')
				.addClass('btn-warning');
		}
	} else {
		$('#updateBtn')
			.removeClass('btn-danger btn-success btn-warning')
			.addClass('bg-azulbaculo');

		updateBtn.innerHTML =
			'<span> <i class="fas fa-save" aria-hidden="true"></i> </span> Presupuesto';
	}
});

updateBtn.addEventListener('click', function (event) {
	const allset = grid.selectAllRows();
	const allfilas = grid.getSelectedRows();
	const idlayout = $('#idlayout').val();
	//const idversion =  $('#idversion').val();
	const observaciones = $('#observaciones').val();

	const DIFGENERAL = parseFloat(Ggrid.getCellValue(5, COLUMNAS[0]));

	if (DIFGENERAL != parseFloat(0.0)) {
		grid.clearSelection();
		grid.refreshView();
		//toast.closeLast();
		toast.open();
		toast.type = 'error';
		toast.value = 'No puede grabar existen diferencias de reparto .....';
		Ggrid.setRowStyle(5, {
			fontFamily: 'Poppins',
			background: 'red',
			color: 'white',
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
	toast.type = 'info';
	toast.value = 'Guardando  Datos en BBDD .....';
	fetch(
		'http://localhost:3000/objetivos/recibeAjax/?uno=' +
			idlayout +
			'&dos=' +
			IDVERSION.value,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(allfilas),
		}
	)
		.then((response) => response.json())
		.then((data) => {
			if (data == 'Ok') {
				toast.type = 'success';
				toast.value = 'Datos Guardados con Exito ';
			} else {
				toast.type = 'error';
				toast.value = 'Error al Guardar los datos \n' + data;
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
			console.error('Error:', error);
		});
});

exportBtn.addEventListener('click', function (event) {
	//const allfilas = grid.getSelectedRows();
	//grid.exportData('xlsx');
	const allset = grid.selectAllRows();
	const allfilas = grid.getSelectedRows();
	const codigo = $('#codigo').val();

	toast.closeLast();
	toast.value = 'Exportando Datos .....';
	toast.open();
	fetch('http://localhost:3000/objetivos/descargafile/' + codigo, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(allfilas),
	})
		.then((response) => response.json())
		.then((data) => {
			grid.refreshView();
			$(location).attr('href', '/objetivos/descargaexcel');
		})
		.catch((error) => {
			console.error('Error:', error);
		});
	grid.clearSelection();
	toast.value = 'Datos Exportados .....';
});

var cambiartipopeso = function (tipo) {
	if (tipo == 't') {
		if (bloqueonivel > 0) {
			tabs.update(
				1,
				'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Compa????a <span class="smart-badge smart-badge-danger smart-badge-pill">' +
					bloqueonivel +
					'%</span>'
			);
		} else {
			tabs.update(
				1,
				'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Compa????a'
			);
		}
	}
	if (tipo == 'i') {
		if (bloqueonivel > 0) {
			tabs.update(
				1,
				'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Individual <span class="smart-badge smart-badge-danger smart-badge-pill">' +
					bloqueonivel +
					'%</span>'
			);
		} else {
			tabs.update(
				1,
				'<a href="#" ><i class="fa fa-cogs azulbaculo" aria-hidden="true" ></i></a> &nbsp Peso Indivdual'
			);
		}
	}
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
		fontFamily: 'Poppins',
		background: 'default',
		color: 'default',
	});
	Ggrid.beginUpdate();
	Ggrid.setCellValue(
		3,
		'Descripcion',
		grid.getCellValue(padre, 'Descripcion') + ' % S/ Grupo'
	);
	Ggrid.setCellValue(
		4,
		'Descripcion',
		grid.getCellValue(fila.id, 'Descripcion') + ' % S/ Su Total'
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
			Ggrid.rows[2].cells[i + 1].color = 'default';
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
				Ggrid.rows[2].cells[i + 1].background = 'red';
				Ggrid.rows[2].cells[i + 1].color = 'white';
			} else {
				Ggrid.rows[2].cells[i + 1].background =
					COLORES_FONDO[fila.level - 1];
				Ggrid.rows[2].cells[i + 1].color = 'black';
			}
		}
		if (parseFloat(grid.getCellValue(fila.id, COLUMNAS[i])) == 0) {
			peso = 0.0;
			Ggrid.rows[3].cells[i + 1].background = COLORES_FONDO[fila.level];
			Ggrid.rows[3].cells[i + 1].color = 'default';
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
				Ggrid.rows[3].cells[i + 1].background = 'red';
				Ggrid.rows[3].cells[i + 1].color = 'white';
			} else {
				Ggrid.rows[3].cells[i + 1].background =
					COLORES_FONDO[fila.level];
				Ggrid.rows[3].cells[i + 1].color = 'default';
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
		//Cargamos diferencias
		Ggrid.setCellValue(
			5,
			COLUMNAS[i],
			redondea(parseFloat(midiferencia[i]))
		);
		// Tabla TGrid Totales Cia
		Tgrid.setCellValue(3, COLUMNAS[i], grid.getCellValue(1, COLUMNAS[i]));
		Tgrid.setRowStyle(3, {
			fontFamily: 'Poppins',
			background: 'default',
			color: '#1cabe9',
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
				)
			)
		);
		//% Nuevo Total Vs Presupuesto Original.
		var diferencial = redondea(
			(parseFloat(Tgrid.getCellValue(3, COLUMNAS[i])) /
				parseFloat(Tgrid.getCellValue(1, COLUMNAS[i])) -
				1) *
				100
		);
		Tgrid.setCellValue(5, COLUMNAS[i], parseFloat(diferencial));
		if (diferencial >= 0) {
			Tgrid.setCellStyle(5, COLUMNAS[i], {
				background: 'default',
				color: COLORES_LETRA[4],
			});
			Tgrid.setCellStyle(5, 'Descripcion', {
				background: 'default',
				color: COLORES_LETRA[4],
			});
		} else {
			Tgrid.setCellStyle(5, COLUMNAS[i], {
				background: 'default',
				color: COLORES_LETRA[3],
			});
			Tgrid.setCellStyle(5, 'Descripcion', {
				background: 'default',
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
		fontFamily: 'Poppins',
		background: 'default',
		color: '#1cabe9',
	});
	if (parseFloat(Tgrid.getCellValue(5, COLUMNAS[0])) >= 0) {
		Tgrid.setRowStyle(5, {
			fontFamily: 'Poppins',
			background: 'default',
			color: COLORES_LETRA[4],
		});
	} else {
		Tgrid.setRowStyle(5, {
			fontFamily: 'Poppins',
			background: 'default',
			color: COLORES_LETRA[3],
		});
	}
	diferencia = redondea(
		parseFloat(grid.getCellValue(1, COLUMNAS[0])) -
			parseFloat(Ggrid.getCellValue(1, COLUMNAS[0]))
	);

	if (diferencia < 0) {
		Ggrid.setRowStyle(2, {
			fontFamily: 'Poppins',
			background: 'default',
			color: 'red',
		});
		Tgrid.setRowStyle(3, {
			fontFamily: 'Poppins',
			background: 'default',
			color: 'red',
		});
		Tgrid.setRowStyle(4, {
			fontFamily: 'Poppins',
			background: 'default',
			color: 'red',
		});
	} else if (diferencia > 0) {
		Ggrid.setRowStyle(2, {
			fontFamily: 'Poppins',
			background: 'default',
			color: '#1cabe9',
		});
		Tgrid.setRowStyle(3, {
			fontFamily: 'Poppins',
			background: 'default',
			color: '#1cabe9',
		});
		Tgrid.setRowStyle(4, {
			fontFamily: 'Poppins',
			background: 'default',
			color: '#1cabe9',
		});
	} else {
		Ggrid.setRowStyle(2, {
			fontFamily: 'Poppins',
			background: 'default',
			color: 'black',
		});
		Tgrid.setRowStyle(3, {
			fontFamily: 'Poppins',
			background: 'default',
			color: 'black',
		});
		Tgrid.setRowStyle(4, {
			fontFamily: 'Poppins',
			background: 'default',
			color: 'black',
		});
	}

	Ggrid.setCellValue(3, 'Idx', parseFloat(fila.index));
	Ggrid.setCellValue(4, 'Idx', parseFloat(fila.index));
	Ggrid.setCellValue(5, 'Idx', parseFloat(fila.index));
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
		fontFamily: 'Poppins',
		fontWeight: 600,
		background: COLORES_FONDO[fila.level],
		color: COLORES_LETRA[fila.level],
	});

	if (fila.children != undefined) {
		fila.children.forEach((hijo) => {
			console.log('Hijos ', hijo.data.Descripcion);
			if (color && hijo.level < MAXIMONIVEL) {
				grid.setRowStyle(hijo.id, {
					fontFamily: 'Poppins',
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
var operarhijos = async function (
	fila,
	columna,
	ltotalanterior,
	ltotalnuevo,
	totales
) {
	var ltotal = 0;
	var lvalor = 0;
	var lanterior = 0;

	const unitario = redondea(ltotalnuevo / gcuentaniveles[MAXIMONIVEL]);
	grid.setCellValue(fila.id, columna, redondea(ltotalnuevo, 2));
	if (fila.children === undefined) {
		return;
	}

	fila.children.forEach(function (hijos) {
		var ftotal = 0;
		if (ltotalanterior == 0) {
			lvalor = unitario * data.maxnivel[data.ix.indexOf(hijos.index)];
		} else {
			lanterior = redondea(grid.getCellValue(hijos.id, columna));
			lvalor = redondea(
				(grid.getCellValue(hijos.id, columna) / ltotalanterior) *
					ltotalnuevo
			);
		}
		ltotal = redondea(
			grid.getCellValue(hijos.id, COLUMNAS[0]) + lvalor - lanterior,
			2
		);

		grid.setCellValue(hijos.id, columna, redondea(lvalor, 2));
		if (totales) {
			grid.setCellValue(hijos.id, COLUMNAS[0], redondea(ltotal, 2));
		}

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
var operarpadres = async function (
	fila,
	columna,
	ltotalanterior,
	ltotalnuevo,
	totales
) {
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

	if (columna != 'Tot') {
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
	if (totales) {
		grid.setCellValue(fila.id, COLUMNAS[0], redondea(ltotal));
	}

	if (fila.parent != undefined) {
		// Si tiene m??s padres
		await operarpadres(
			fila.parent,
			columna,
			ltotalanterior,
			ltotalnuevo,
			totales
		);
	}
};

// Funcion que realiza el calculo de hijos y padres del Grid
// Calculattion Childrens and Parents in the Grid
var operar = async function (
	ltotalanterior,
	ltotalnuevo,
	fila,
	columna,
	totales
) {
	var ltotal = 0;
	var lvalor = 0;
	var resto = 0;
	var reg = {
		mifila: {},
		columna: '',
		ltotalanterior: 0.0,
		ltotalnuevo: 0.0,
	};

	grid.beginUpdate();

	grid.setCellValue(fila.id, columna, redondea(ltotalnuevo, 2));
	grid.collapseAllRows();
	// Abrimo arbol  y Contamos Niveles
	// grid.checkRow(fila.id);
	//grid.expandAllRows();
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
	if (columna == 'Tot') {
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
		resto = redondea(ltotalnuevo - redondea(ltotal));

		// if (resto > 0) {
		// 	lvalor -= resto;
		// 	//ftotal -= resto;
		// } else {
		// 	lvalor += resto;
		// 	//ftotal += resto;
		// }
		lvalor += resto;
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
				parseFloat(ltotalnuevo)
		);

		if (totales) {
			grid.setCellValue(fila.id, COLUMNAS[0], redondea(lvalor));
		}

		await operarhijos(fila, columna, ltotalanterior, ltotalnuevo, totales);
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
		await operarpadres(
			mifila.parent,
			columna,
			ltotalanterior,
			ltotalnuevo,
			totales
		);
	}

	grid.endUpdate();

	grid.refreshView();
	//Abrimos Level = 0
	grid.expandRow(1);
	//toast.closeLast();
	toast.open();
	toast.type = 'success';
	toast.value = 'Calculo Finalizado. ' + columna;

	return filaspdtes;
};

//Redndeo a n decimales
function redondea(numero, n = 3) {
	var dec = (1 + '0'.repeat(n)) * 1;
	var n = Number(Math.abs(numero) * dec).toPrecision(15);
	return (Math.round(n) / dec) * Math.sign(numero);
}

//Compara dos objetos true -> Iguales o False -> Distintos
var objCompare = (arg1, arg2) => {
	if (
		Object.prototype.toString.call(arg1) ===
		Object.prototype.toString.call(arg2)
	) {
		if (
			Object.prototype.toString.call(arg1) === '[object Object]' ||
			Object.prototype.toString.call(arg1) === '[object Array]'
		) {
			if (Object.keys(arg1).length !== Object.keys(arg2).length) {
				return false;
			}
			return Object.keys(arg1).every(function (key) {
				return objCompare(arg1[key], arg2[key], 'F');
			});
		}
		return arg1 === arg2;
	}
	return false;
};

var cabecera = [
	{
		label: 'Descripcion',
		dataField: 'Descripcion',
		dataType: 'string',
		allowEdit: false,
		width: 538,
	},
	{
		label: 'Total en ' + RESUMEN,
		dataField: 'Tot',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Ene',
		dataField: 'Ene',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Feb',
		dataField: 'Feb',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Mar',
		dataField: 'Mar',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Abr',
		dataField: 'Abr',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'May',
		dataField: 'May',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Jun',
		dataField: 'Jun',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Jul',
		dataField: 'Jul',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Ago',
		dataField: 'Ago',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Sep',
		dataField: 'Sep',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Oct',
		dataField: 'Oct',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Nov',
		dataField: 'Nov',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Dic',
		dataField: 'Dic',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
];
var filas = [
	'Pk: number',
	'1: string',
	'2: string',
	'3: string',
	'4: string',
	'Descripcion: string',
	'Tot: number',
	'Ene: number',
	'Feb: number',
	'Mar: number',
	'Abr: number',
	'May: number',
	'Jun: number',
	'Jul: number',
	'Ago: number',
	'Sep: number',
	'Oct: number',
	'Nov: number',
	'Dic: number',
	'Idx: number',
	'Response: number',
	'Nivel: number',
	'Clave: string',
	'Indice: string',
];

window.Smart(
	'#grid',
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
					action: 'click',
					//mode: "row",
					mode: 'cell',
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
					mode: 'one',
					allowCellSelection: false,
				},
				behavior: { columnResizeMode: 'growAndShrink' },
				layout: {
					rowHeight: 'auto',
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
					template: '#footerTemplate',
				},
				columns: cabecera,
				dataSource: new window.Smart.DataAdapter({
					dataSource:
						'http://localhost:3000/objetivos/leoobjetivos/?uno=' +
						IDLAYOUT +
						'&dos=' +
						IDVERSION.value,
					dataSourceType: 'json',
					keyDataField: 'Idx',
					parentDataField: 'Response',
					id: 'Idx',
					dataFields: filas,
				}),
				onInit: function () {
					toast.open();
					toast.type = 'warning';
					toast.value = 'Cargando Datos de BBDD .....';
				},

				onCommand: function (args) {
					if (args.name === 'commandColumnRowMenuCommand') {
						const row = args.details;
						const menu = document.getElementById('menu');
						args.event.preventDefault();
						menu.setAttribute('data-row-idx', row.index);
						menu.open(
							args.event.pageX - 150,
							args.event.pageY + 20
						);
						args.handled = true;
					}
				},
				onKey: function (event) {
					if (event.ctrlKey && event.key === 'z') {
						event.stopImmediatePropagation();
						event.preventDefault();
						grid.cancelEdit();
					}
				},
				onRowInit: function (index, row) {
					if (row.id === 1) {
						toast.closeLast();
						toast.open();
						toast.type = 'success';
						toast.value = 'Datos Cargados con Exito .....';
						row.expanded = true;
						row.freeze = 'near';
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
						console.log('Change ', fila);
						console.log('Time Inicio', new Date().toLocaleString());
						misvalores = await operar(
							oldValue,
							newValue,
							fila,
							columna,
							true
						);
						confirm(true);
						calculapesos(fila);
						console.log('Time Inicio', new Date().toLocaleString());
					} else {
						confirm(false);
					}
				},
			};
		}
	}
);

grid.addEventListener('beginEdit', function (event) {
	const detail = event.detail,
		row = detail.row,
		originalEvent = detail.originalEvent,
		id = detail.id,
		isRightClick = detail.isRightClick,
		pageX = detail.pageX,
		pageY = detail.pageY;
});
grid.addEventListener('rowClick', function (event) {
	const detail = event.detail,
		row = detail.row,
		originalEvent = detail.originalEvent,
		id = detail.id,
		isRightClick = detail.isRightClick,
		pageX = detail.pageX,
		pageY = detail.pageY;
	event.preventDefault();

	FILA_INDEX = row.index;
	LAFILA = row;
	calculapesos(row);
	//grid.refreshView();

	// grid.columns[0].label = "Fernando Pell??s";
}),
	grid.addEventListener('rowExpand', function (event) {
		const detail = event.detail,
			erow = detail.row,
			eid = detail.id,
			eoriginalEvent = detail.originalEvent;
		//event.preventDefault();
		grid.setRowStyle(erow.id, {
			fontFamily: 'Poppins',
			fontWeight: 600,
			background: 'default',
			color: 'default',
		});
		if (erow.id > 1) {
			abrirarbol(erow, false, true);
		}
	}),
	grid.addEventListener('rowCollapse', function (event) {
		const detail = event.detail,
			erow = detail.row,
			eid = detail.id,
			eoriginalEvent = detail.originalEvent;

		grid.setRowStyle(erow.id, {
			fontFamily: 'Poppins',
			fontWeight: 'default',
			background: 'default',
			color: 'default',
		});
	}),
	menu.addEventListener('itemClick', function (event) {
		const rowIdx = parseInt(menu.getAttribute('data-row-idx'));
		var mrow = grid.rows[rowIdx];
		if (mrow) {
			event.detail.item.getAttribute('data-id');
			// Recuperamos los valores del Grid por Ajax
			if (event.detail.item.getAttribute('data-id') === 'Recalcular') {
				grid.dataSource = new window.Smart.DataAdapter({
					dataSource:
						'http://localhost:3000/objetivos/leoobjetivos/?uno=' +
						IDLAYOUT +
						'&dos=' +
						IDVERSION.value,
					dataSourceType: 'json',
					keyDataField: 'Idx',
					parentDataField: 'Response',
					id: 'Idx',
					dataFields: filas,
				});
			}
			// Colapsamos todos los elementos del mismo nivel
			if (event.detail.item.getAttribute('data-id') === 'Colapsar') {
				grid.beginUpdate();
				//event.preventDefault();
				var indice = parseInt(mrow.index);
				var inicial = parseInt(mrow.index);
				var mifila = { ...grid.rows[indice] };

				while (mifila.level > 0) {
					if (mifila.level >= mrow.level) {
						grid.collapseRow(mifila.id);
						grid.setRowStyle(mifila.id, {
							fontFamily: 'Poppins',
							fontWeight: 'default',
							background: 'red',
							color: 'default',
						});
					}
					indice -= 1;
					mifila = { ...grid.rows[indice] };
				}

				mifila.children.forEach((hijo) => {
					if (hijo.level >= mrow.level) {
						grid.collapseRow(hijo.id);

						grid.setRowStyle(hijo.id, {
							fontFamily: 'Poppins',
							fontWeight: 'default',
							background: 'default',
							color: 'default',
						});
					}
				});

				if (mrow.level > 0) {
					grid.setRowStyle(mrow.id, {
						fontFamily: 'Poppins',
						fontWeight: 'default',
						background: 'default',
						color: 'default',
					});
				}
				mifila = { ...grid.rows[inicial] };

				grid.collapseRow(mrow.id);
				grid.endUpdate();
				grid.refreshView();
			}
			// Expandimos todos los hijos de un nivel
			if (event.detail.item.getAttribute('data-id') === 'Expandir') {
				grid.beginUpdate();
				var indice = parseInt(mrow.index);
				var mifila = grid.rows[indice];
				var nivel = mifila.level;

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
resumenlayout.addEventListener('cellClick', function (event) {
	const detail = event.detail,
		cell = detail.cell,
		originalEvent = detail.originalEvent,
		id = detail.id,
		dataField = detail.dataField,
		isRightClick = detail.isRightClick,
		pageX = detail.pageX,
		pageY = detail.pageY;

	//event.preventDefault();
	const row = cell.row;
	FILA_RESUMEN = id;

	distribucion.uncheckAllRows();
	if (!sumapadres.checkStatus && dataField == 'bloqueado') {
		distribucion;
		bloqueonivel = row.data.nivel;
		resumenlayout.refreshView();
	}
});
// distribucion.addEventListener('rowClick', function (event) {
// 	const detail = event.detail,
// 		row = detail.row,
// 		originalEvent = detail.originalEvent,
// 		id = detail.id,
// 		isRightClick = detail.isRightClick,
// 		pageX = detail.pageX,
// 		pageY = detail.pageY;

// 	event.preventDefault();

// 	var ffilas = [];

// 	grid.expandAllRows();
// 	grid.clearFilter();
// 	var valorfiltromin = '>= ' + row.data.LimInf;
// 	var valorfiltromax = ' AND <= ' + row.data.LimSup;
// 	var bloqueofiltro = '= ' + resumenlayout.rows[FILA_RESUMEN].data.nivel;
// 	grid.addFilter('level', bloqueofiltro, false);
// 	grid.addFilter('Tot', [valorfiltromin, valorfiltromax], true);

// 	//grid.setRowProperty(1, "freeze", false);
// 	//grid.highlightCell(1, "firstName", "cssClass");

// 	document.getElementById('ceros').innerHTML =
// 		'Ceros -> ' + 'AZUCAR CAJA 1000 UDS_';
// 	//ffilas = grid.getVisibleRows();

// 	//ffilas = grid.findCells(1245.18);
// 	//ffilas = grid.find("Tot", 1245.18, "=");

// 	//grid.selectRowsByQuery(416.67, "Ene", "EQUAL");
// 	// grid.selectCellsByQuery("5000.00");
// 	//ffilas = grid.getSelectedRows();

// 	// var cuentaceros = 0;
// 	// for (var i = 0; i <= grid.rows.length; i++) {
// 	// 	var celda = grid.rows[i].cells[1];
// 	// 	if (celda.value === 0 && celda.row.level == MAXIMONIVEL) {
// 	// 		celda.background = "cyan";
// 	// 		//await operar(0, celda.value, celda.row, "Tot");
// 	// 		cuentaceros += 1;
// 	// 		ffilas.push(celda.row);
// 	// 	}
// 	// }
// });
// ------------------------------------- ttable.js ------------------------------- //
window.onload = function () {
	$('#spindist').hide();
	$('#spincalc').hide();
};
const rgrid = document.querySelector('#Ggrid');
var oldElements,
	newElements = [];
var iconobloqueo = '';
// const tgrid = document.querySelector("#Tgrid");

rgrid.addEventListener('cellClick', function (event) {
	const detail = event.detail,
		cell = detail.cell,
		originalEvent = detail.originalEvent,
		id = detail.id,
		dataField = detail.dataField,
		isRightClick = detail.isRightClick,
		pageX = detail.pageX,
		pageY = detail.pageY;

	if (id == 1 || id == 2 || id == 5) {
		rgrid.editing.enabled = false;
		rgrid.cancelEdit();
	} else {
		rgrid.editing.enabled = true;
	}
});

// const distable = document.getElementById("distable");
// const resumenlayout = document.getElementById("resumenlayout");
const idlayout = $('#idlayout').val();
const maxnivel = $('#maxnivel').val();
const version = $('#version').val();
const resumen = $('#resumen').val();
const niveles = $('#niveles').val().split(',');
var cnivel = 1;
const cabeceraDist = [
	{
		label: resumen,
		dataField: 'Intervalo',
		dataType: 'string',
		align: 'left',
	},
	{
		label: '# ' + niveles[cnivel],
		dataField: 'FreqAbs',
		dataType: 'number',
		align: 'left',
	},
	{
		label: 'Peso',
		dataField: 'FreqRel',
		dataType: 'number',
		align: 'left',
		formatFunction(settings) {
			const value = settings.value;
			var className = '';
			if (settings.value >= 60) {
				className = 'badge rounded-pill text-bg-success';
			} else if (value >= 20) {
				className = 'badge rounded-pill text-bg-info';
			} else {
				className = 'badge rounded-pill text-bg-secondary';
			}
			settings.template = `<span class="${className}">${value}%</span>`;
		},
	},
	{
		label: 'Limite Sup',
		dataField: 'LimInf',
		dataType: 'number',
		align: 'left',
		visible: false,
	},
	{
		label: 'Limite Inf',
		dataField: 'LimSup',
		dataType: 'number',
		align: 'left',
		visible: false,
	},
];
var Dfilas = [
	'Intervalo: string',
	'FreqAbs: number',
	'FreqRel: number',
	'LimInf: number',
	'LimSup: number',
];
window.Smart(
	'#distable',
	class {
		get properties() {
			return {
				dataSource: new window.Smart.DataAdapter({
					dataSource: [],
					dataFields: Dfilas,
				}),
				selection: {
					enabled: true,
					mode: 'one',
					checkBoxes: {
						enabled: true,
						selectAllMode: 'none',
					},
				},
				editing: {
					batch: false,
					enabled: false,
					action: 'click',
					mode: 'cell',
				},
				behavior: { columnResizeMode: 'growAndShrink' },
				layout: {
					rowHeight: 'auto',
					rowMinHeight: 30,
					allowCellsWrap: true,
				},

				header: {
					visible: false,
					buttons: [],
				},
				columns: cabeceraDist,
			};
		}
	}
);

$.ajax({
	url: '/objetivos/distribucion',
	type: 'GET',
	dataType: 'json',
	cache: false,
	data: {
		layout_id: idlayout,
		nivel_id: 1,
		version: version,
	},
	success: function (datosdist) {
		distable.dataSource = datosdist;
		distable.refresh();
	},
	error: function (jqXHR, textStatus, err) {
		alert('Error ' + textStatus + ', err ' + err);
	},
});
window.Smart(
	'#resumenlayout',
	class {
		get properties() {
			return {
				dataSource: new window.Smart.DataAdapter({
					dataSource: [],
					dataFields: [
						'nivel: number',
						'descripcion: string',
						'count: number',
						'bloqueado: string',
					],
				}),
				selection: {
					enabled: true,
					mode: 'one',
					checkBoxes: {
						enabled: true,
						selectAllMode: 'none',
					},
				},
				editing: {
					batch: false,
					enabled: false,
					action: 'click',
					mode: 'cell',
				},
				behavior: { columnResizeMode: 'growAndShrink' },
				layout: {
					rowHeight: 'auto',
					rowMinHeight: 30,
					allowCellsWrap: true,
				},

				header: {
					visible: false,
					buttons: [],
				},
				columns: [
					{
						label: 'Nombre',
						dataField: 'descripcion',
						dataType: 'string',
					},
					{
						label: 'Nivel',
						dataField: 'nivel',
						dataType: 'number',
						align: 'left',
					},

					{
						label: 'Registros',
						dataField: 'count',
						dataType: 'number',
						align: 'left',
						formatFunction(settings) {
							settings.template = `<span class="badge rounded-pill text-bg-success">${settings.value}</span>`;
						},
					},
					{
						label: 'Bloqueado',
						dataField: 'bloqueado',
						dataType: 'string',
						cellsAlign: 'center',
						align: 'left',
						formatFunction(settings) {
							if (
								!sumapadres.checkStatus &&
								settings.cell.row.data.nivel == bloqueonivel
							) {
								settings.value =
									'<i class="fa fa-lock fa-lg text-danger" aria-hidden="true"></i>';
							} else {
								settings.value =
									'<i class="fa fa-unlock fa-lg text-success" aria-hidden="true"></i>';
							}
						},
					},
				],
			};
		}
	}
);
$.ajax({
	url: '/objetivos/resumenlayout',
	type: 'GET',
	dataType: 'json',
	cache: false,
	data: { layout_id: idlayout },
	success: function (datoslayout) {
		resumenlayout.dataSource = datoslayout;
		resumenlayout.refresh();
	},
	error: function (jqXHR, textStatus, err) {
		alert('Error ' + textStatus + ', err ' + err);
	},
});

resumenlayout.addEventListener('rowClick', function (event) {
	const detail = event.detail,
		row = detail.row,
		originalEvent = detail.originalEvent,
		id = detail.id,
		isRightClick = detail.isRightClick,
		pageX = detail.pageX,
		pageY = detail.pageY;

	cargadist(row.data.nivel);
});

// distable.addEventListener("rowClick", function (event) {
// 	const detail = event.detail,
// 		row = detail.row,
// 		originalEvent = detail.originalEvent,
// 		id = detail.id,
// 		isRightClick = detail.isRightClick,
// 		pageX = detail.pageX,
// 		pageY = detail.pageY;

// 	iconobloqueo = changeIcono();
// 	console.log(iconobloqueo);
// 	resumenlayout.refreshView();
// });
//Compara dos objetos y devuelve las claves con diferente valor de Un JSON
var sacaKeys = function (a, b) {
	return Object.keys(a).filter(function (key) {
		return a[key] != b[key];
	});
};
//Devuelve las claves de un JSON
var cogeKeys = function (a) {
	return Object.keys(a);
};

function updateElement(index, newElements) {
	const diff = elements.reduce((a, b) => a + b, 0) - 100;
	newElements[index] -= diff;
	console.log('Dentro ', elements[index]);
}
function calculapDif(newElements, cambios) {
	const diff = newElements.reduce((a, b) => a + b, 0) - 100;
	//Asigmanos la parte de ajuste por cada mes que no se modifica el valor
	return redondea(diff / (12 - cambios.length), 4);
	// var stored = store.reduce(function (pV, cV, cI) {
	// 	console.log('pv: ', pV);
	// 	pV.push(cV);
	// 	return pV; // *********  Important ******
	// }, []);
}
var cargadist = function (lnivel) {
	$('#spindist').show();

	$.ajax({
		url: '/objetivos/distribucion',
		type: 'GET',
		dataType: 'json',
		cache: false,
		data: {
			layout_id: idlayout,
			nivel_id: lnivel,
			version: version,
		},
		success: function (datosdist) {
			cnivel = lnivel;
			distable.columns[1].label = '# ' + niveles[cnivel];
			distable.dataSource = datosdist;

			distable.refresh();
			$('#spindist').hide();
		},
		error: function (jqXHR, textStatus, err) {
			alert('Error ' + textStatus + ', err ' + err);
		},
	});
};

var Tfilas = [
	'Descripcion: string',
	'Tot: number',
	'Ene: number',
	'Feb: number',
	'Mar: number',
	'Abr: number',
	'May: number',
	'Jun: number',
	'Jul: number',
	'Ago: number',
	'Sep: number',
	'Oct: number',
	'Nov: number',
	'Dic: number',
	'Idx: number',
	'Response: number',
	'Nivel: number',
];

var Tcabecera = [
	{
		label: 'Descripcion',
		dataField: 'Descripcion',
		dataType: 'string',
		allowEdit: false,
		width: 538,
	},

	{
		label: 'Total en ' + resumen,
		dataField: 'Tot',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Ene',
		dataField: 'Ene',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Feb',
		dataField: 'Feb',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Mar',
		dataField: 'Mar',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Abr',
		dataField: 'Abr',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'May',
		dataField: 'May',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Jun',
		dataField: 'Jun',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Jul',
		dataField: 'Jul',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Ago',
		dataField: 'Ago',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Sep',
		dataField: 'Sep',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Oct',
		dataField: 'Oct',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Nov',
		dataField: 'Nov',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Dic',
		dataField: 'Dic',
		align: 'right',
		dataType: 'number',
		cellsFormat: 'n2',
		editor: {
			template: 'numberInput',
			numberFormat: {
				style: 'decimal',
				minimumFractionDigits: 2,
			},
		},
	},
	{
		label: 'Idx',
		dataField: 'Idx',
		align: 'right',
		dataType: 'number',
		visible: false,
		cellsFormat: 'n',
	},
];
window.Smart(
	'#Tgrid',
	class {
		get properties() {
			return {
				editing: {
					batch: false,
					enabled: false,
					action: 'click',
					mode: 'cell',
				},
				behavior: { columnResizeMode: 'growAndShrink' },
				header: {
					visible: false,
					buttons: [],
				},
				columns: Tcabecera,
				dataSource: new window.Smart.DataAdapter({
					dataSource:
						'http://localhost:3000/objetivos/leototalobjetivo/' +
						idlayout,
					dataSourceType: 'json',
					id: 'Idx',
					dataFields: Tfilas,
				}),

				onRowInit(index, row) {
					if (index < 2) {
						row.freeze = 'near';
					}
				},
			};
		}
	}
);
window.Smart(
	'#Ggrid',
	class {
		get properties() {
			return {
				editing: {
					batch: false,
					enabled: true,
					action: 'click',
					mode: 'row',
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
					mode: 'one',
					allowCellSelection: false,
				},
				behavior: { columnResizeMode: 'growAndShrink' },
				layout: {
					rowHeight: 'auto',
					allowCellsWrap: true,
				},
				appearance: {
					allowRowDetailToggleAnimation: false,
				},
				header: {
					visible: false,
					buttons: [],
				},
				columns: Tcabecera,
				dataSource: new window.Smart.DataAdapter({
					dataSource:
						'http://localhost:3000/objetivos/leounobjetivoinicial/' +
						idlayout +
						'/1',
					dataSourceType: 'json',
					id: 'Idx',
					dataFields: Tfilas,
				}),
				onRowInit: function (index, row) {
					if (index < 1) {
						row.freeze = 'near';
					}
				},
				onKey: function (event) {
					if (event.ctrlKey && event.key === 'z') {
						event.stopImmediatePropagation();
						event.preventDefault();
						rgrid.cancelEdit();
					}
				},
				onRowUpdate: async function (
					index,
					row,
					oldValues,
					newValues,
					confirm
				) {
					var cambios = sacaKeys(oldValues[0], newValues[0]);
					cambios.splice(0, 1); // Quitamos el campo descripcion;
					oldElements = Object.keys(oldValues[0]).map(function (k) {
						return oldValues[0][k];
					});

					oldElements.splice(0, 2);
					oldElements.splice(12, 1);

					newValues[0].Descripcion = 'Nada';
					newElements = Object.keys(newValues[0]).map(function (k) {
						return newValues[0][k];
					});
					newElements.splice(0, 2);
					newElements.splice(12, 1);
					var grow = { ...grid.rows[FILA_INDEX] };

					// Si no hemos seleccionado ninguna fila en el grid ppal
					if (
						grow == 'undefined' ||
						(!sumapadres.checkStatus && grow.level <= bloqueonivel)
					) {
						confirm(false);
					} else {
						//Comprobamos si hay cambios en el array
						var misvalores = [];
						if (objCompare(oldValues, newValues)) {
							confirm(false);
						} else {
							var filagrupo = false;
							var cambioTotal = false;
							var elimino = cambios.indexOf('Descripcion');
							if (elimino >= 0) {
								cambios.splice(elimino, 1);
							}
							elimino = cambios.indexOf('Idx');
							if (elimino >= 0) {
								cambios.splice(elimino, 1);
							}
							if (cambios.length >= 1) {
								var tope = cambios.length;
								var a = 0;
								if (cambios.indexOf('Tot') > -1) {
									tope = 1;
									cambioTotal = true;
								} else {
									tope = 13;
									a = 1;
								}
								var fila = { ...grid.rows[FILA_INDEX] };
								var gTot = grow.data.Tot;
								var identificador = grow.id;
								var resto = 0.0;
								var vuelta = 0;
								var difPorcentaje = calculapDif(
									newElements,
									cambios
								);

								// // console.log('Dif ', dif);
								// const gTot = grid.getCellValue(
								// 	identificador,
								// 	COLUMNAS[0]
								// );
								for (var i = a; i < tope; i++) {
									var absOldValue = 0;
									var absNewValue = newValues[0][COLUMNAS[i]];
									var newValue = newValues[0][COLUMNAS[i]];
									var resto = 0.0;
									var cvalor = 0.0;
									var columna = COLUMNAS[i];
									var pidentificador = 0;
									// Una vez comparados
									absOldValue = parseFloat(
										grid.getCellValue(
											identificador,
											columna
										)
									);
									if (index == 2) {
										pidentificador = grow.parentId;
										filagrupo = true;
									}
									if (filagrupo) {
										absNewValue = parseFloat(
											(grid.getCellValue(
												pidentificador,
												columna
											) *
												parseFloat(newValue)) /
												100
										).toFixed(2);
										resto = parseFloat(
											((absNewValue - absOldValue) /
												100) *
												parseFloat(newValue)
										).toFixed(2);

										grid.setCellValue(
											identificador,
											columna,
											parseFloat(absNewValue).toFixed(2)
										);
									} else {
										//Si la columna no se ha modificado, sumamos la fdifsrencia unitaria
										var existe = cambios.indexOf(columna);
										if (existe < 0) {
											newValue -= difPorcentaje;
										}
										absNewValue = redondea(
											(gTot * newValue) / 100,
											2
										);
										await operar;

										grid.setCellValue(
											identificador,
											columna,
											parseFloat(absNewValue).toFixed(2)
										);
									}
									console.log(
										'Time Inicio Grupo',
										new Date().toLocaleString()
									);

									grid.rows[FILA_INDEX].expanded = true;
									console.log(grid.rows[FILA_INDEX]);
									misvalores = await operar(
										absOldValue,
										absNewValue,
										grid.rows[FILA_INDEX],
										COLUMNAS[i],
										cambioTotal
									);
								}
							} else {
								confirm(false);
							}
							if (cambios[0] != 0 && tope > 0) {
								confirm(true);
								rgrid.refreshView();
								calculapesos(grow);
								console.log(
									'Time Fin Grupo',
									new Date().toLocaleString()
								);
							} else {
								confirm(false);
							}
						}
					}
				},
				// onCellUpdate: function (cell, oldValue, newValue, confirm) {
				// 	const row = cell[0].row;
				// 	var grow = grid.rows[row.data.Idx];
				// 	const result = grid.getSelectedRows();
				// 	var filagrupo = false;
				// 	if (result.length == 0) {
				// 		confirm(false);
				// 	}
				// 	var absOldValue = parseFloat(oldValue).toFixed(2);
				// 	var absNewValue = parseFloat(newValue).toFixed(2);
				// 	var resto = 0.0;
				// 	var cvalor = 0.0;
				// 	var columna = cell[0].column.dataField;
				// 	var identificador = grow.id;
				// 	var pidentificador = 0;
				// 	if (absOldValue === absNewValue) {
				// 		console.log(
				// 			'Valor Anterior',
				// 			absOldValue,
				// 			result.length
				// 		);
				// 		confirm(false);
				// 		return;
				// 	}
				// 	absOldValue = parseFloat(
				// 		grid.getCellValue(identificador, columna)
				// 	);
				// 	if (row.index == 2) {
				// 		pidentificador = grow.parentId;
				// 		filagrupo = true;
				// 	}
				// 	if (filagrupo) {
				// 		absNewValue = parseFloat(
				// 			(grid.getCellValue(pidentificador, columna) *
				// 				parseFloat(newValue)) /
				// 				100
				// 		).toFixed(2);
				// 		resto = parseFloat(
				// 			((absNewValue - absOldValue) / 100) *
				// 				parseFloat(newValue)
				// 		).toFixed(2);
				// 		cvalor = parseFloat(absNewValue) + parseFloat(resto);
				// 		cvalor = absNewValue;
				// 		//resto = 0;
				// 		grid.setCellValue(
				// 			identificador,
				// 			columna,
				// 			parseFloat(cvalor).toFixed(2)
				// 		);
				// 	} else {
				// 		//absNewValue =  parseFloat(grid.getCellValue(identificador,columna) * parseFloat(newValue) / 100).toFixed(2);
				// 		absNewValue =
				// 			(parseFloat(
				// 				grid.getCellValue(identificador, COLUMNAS[0])
				// 			).toFixed(2) *
				// 				parseFloat(newValue).toFixed(2)) /
				// 			100;
				// 		resto =
				// 			(parseFloat(absNewValue).toFixed(2) -
				// 				parseFloat(absOldValue).toFixed(2)) *
				// 			0;
				// 		cvalor = 0;
				// 		cvalor = parseFloat(resto) + parseFloat(absNewValue);
				// 		grid.setCellValue(
				// 			identificador,
				// 			columna,
				// 			parseFloat(cvalor).toFixed(2)
				// 		);
				// 	}
				// 	// console.log(
				// 	// 	"Viejo / Nuevo / Cvalor / Resto",
				// 	// 	absOldValue,
				// 	// 	absNewValue,
				// 	// 	cvalor,
				// 	// 	resto
				// 	// );
				// 	operar(absOldValue, cvalor, grow, columna, false);
				// 	confirm(true);
				// 	rgrid.refreshView();
				// 	calculapesos(grow);
				// },
			};
		}
	}
);
