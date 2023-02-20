import {
	operar,
	calculapesos,
	abrirarbol,
	changeIcono,
	objCompare,
	redondea,
	FILA_INDEX,LAFILA
	sumapadres,
	bloqueonivel,
} from './griddb.js';

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
const cabecera = [
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
				columns: cabecera,
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
								grow = { ...grid.rows[FILA_INDEX] };
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

										grid.setCellValue(
											identificador,
											columna,
											parseFloat(absNewValue).toFixed(2)
										);
									}
									console.log('Veces ', COLUMNAS[i]);
									misvalores = await operar(
										absOldValue,
										absNewValue,
										LAFILA,
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
export { cargadist };
