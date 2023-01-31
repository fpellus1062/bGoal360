import { operar, calculapesos, changeIcono } from "./griddb.js";
window.onload = function () {};

const rgrid = document.querySelector("#Ggrid");
rgrid.charting.enabled = true;
// const Tgrid = document.querySelector("#Tgrid");
rgrid.addEventListener("cellClick", function (event) {
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

const distable = document.getElementById("distable");
const idlayout = $("#idlayout").val();
const maxnivel = $("#maxnivel").val();
const version = $("#version").val();
const resumen = $("#resumen").val();
const cabecera = [
	{
		label: resumen,
		dataField: "Intervalo",
		dataType: "string",
		with: 60,
	},
	{
		label: "# " + maxnivel,
		dataField: "FreqAbs",
		dataType: "number",
		align: "right",
	},
	{
		label: "Peso",
		dataField: "FreqRel",
		dataType: "number",
		formatFunction(settings) {
			const value = settings.value;
			var className = "";
			if (settings.value >= 60) {
				className = "badge rounded-pill text-bg-success";
			} else if (value >= 20) {
				className = "badge rounded-pill text-bg-info";
			} else {
				className = "badge rounded-pill text-bg-secondary";
			}
			settings.template = `<span class="${className}">${value}%</span>`;
		},
	},
];

window.Smart(
	"#distable",
	class {
		get properties() {
			return {
				dataSource: new window.Smart.DataAdapter({
					dataSource: [],
					dataFields: [
						"Intervalo: string",
						"FreqAbs: number",
						"FreqRel: number",
					],
				}),
				columnResize: true,
				columnResizeFeedback: true,
				freezeHeader: true,
				columns: cabecera,
			};
		}
	}
);
$.ajax({
	url: "/objetivos/distribucion",
	type: "GET",
	dataType: "json",
	cache: false,
	data: {
		layout_id: idlayout,
		nivel_id: maxnivel,
		version: version,
	},
	success: function (datosdist) {
		console.log(datosdist);
		distable.dataSource = datosdist;
		distable.refresh();
	},
	error: function (jqXHR, textStatus, err) {
		alert("Error " + textStatus + ", err " + err);
	},
});
var iconoGgrid = "";
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

var Tfilas = [
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
];

var Tcabecera = [
	{
		label: "Descripcion",
		dataField: "Descripcion",
		dataType: "string",
		allowEdit: false,
		width: 538,
	},

	{
		label: "Total en " + resumen,
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
	{
		label: "Idx",
		dataField: "Idx",
		align: "right",
		dataType: "number",
		visible: false,
		cellsFormat: "n",
	},
];
window.Smart(
	"#Tgrid",
	class {
		get properties() {
			return {
				editing: {
					batch: false,
					enabled: false,
					action: "click",
					mode: "cell",
				},
				behavior: { columnResizeMode: "growAndShrink" },
				header: {
					visible: false,
					buttons: [],
				},
				columns: Tcabecera,
				dataSource: new window.Smart.DataAdapter({
					dataSource:
						"http://localhost:3000/objetivos/leototalobjetivo/" +
						idlayout,
					dataSourceType: "json",
					id: "Idx",
					dataFields: Tfilas,
				}),
				onRowInit(index, row) {
					if (index < 2) {
						row.freeze = "near";
					}
				},
			};
		}
	}
);
window.Smart(
	"#Ggrid",
	class {
		get properties() {
			return {
				editing: {
					batch: false,
					enabled: false,
					action: "click",
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
						"http://localhost:3000/objetivos/leounobjetivoinicial/" +
						idlayout +
						"/1",
					dataSourceType: "json",
					id: "Idx",
					dataFields: Tfilas,
				}),
				onRowInit: function (index, row) {
					if (index < 1) {
						row.freeze = "near";
					}
				},
				onCellUpdate: function (cell, oldValue, newValue, confirm) {
					const row = cell[0].row;
					var grow = grid.rows[row.data.Idx];
					const result = grid.getSelectedRows();
					var filagrupo = false;

					if (result.length == 0) {
						confirm(false);
					}

					var absOldValue = parseFloat(oldValue).toFixed(2);
					var absNewValue = parseFloat(newValue).toFixed(2);
					var resto = 0.0;
					var cvalor = 0.0;
					var columna = cell[0].column.dataField;
					var identificador = grow.id;
					var pidentificador = 0;

					if (absOldValue === absNewValue) {
						console.log(
							"Valor Anterior",
							absOldValue,
							result.length
						);
						confirm(false);
						return;
					}

					absOldValue = parseFloat(
						grid.getCellValue(identificador, columna)
					);
					if (row.index == 2) {
						pidentificador = grow.parentId;
						filagrupo = true;
					}

					if (filagrupo) {
						absNewValue = parseFloat(
							(grid.getCellValue(pidentificador, columna) *
								parseFloat(newValue)) /
								100
						).toFixed(2);
						resto = parseFloat(
							((absNewValue - absOldValue) / 100) *
								parseFloat(newValue)
						).toFixed(2);
						cvalor = parseFloat(absNewValue) + parseFloat(resto);
						cvalor = absNewValue;
						//resto = 0;
						grid.setCellValue(
							identificador,
							columna,
							parseFloat(cvalor).toFixed(2)
						);
					} else {
						//absNewValue =  parseFloat(grid.getCellValue(identificador,columna) * parseFloat(newValue) / 100).toFixed(2);
						absNewValue =
							(parseFloat(
								grid.getCellValue(identificador, COLUMNAS[0])
							).toFixed(2) *
								parseFloat(newValue).toFixed(2)) /
							100;
						resto =
							(parseFloat(absNewValue).toFixed(2) -
								parseFloat(absOldValue).toFixed(2)) *
							0;

						cvalor = 0;
						cvalor = parseFloat(resto) + parseFloat(absNewValue);

						grid.setCellValue(
							identificador,
							columna,
							parseFloat(cvalor).toFixed(2)
						);
					}

					// console.log(
					// 	"Viejo / Nuevo / Cvalor / Resto",
					// 	absOldValue,
					// 	absNewValue,
					// 	cvalor,
					// 	resto
					// );

					operar(absOldValue, cvalor, grow, columna);
					confirm(true);
					rgrid.refreshView();
					calculapesos(grow);
				},
			};
		}
	}
);
