import { operar, calculapesos, changeIcono } from "./griddb.js";
window.onload = function () {};

//const Ggrid = document.querySelector("smart-grid")[1];
// const Tgrid = document.querySelector("#Tgrid");
Ggrid.addEventListener("cellDoubleClick", function (event) {
	const detail = event.detail,
		cell = detail.cell,
		originalEvent = detail.originalEvent,
		id = detail.id,
		dataField = detail.dataField,
		isRightClick = detail.isRightClick,
		pageX = detail.pageX,
		pageY = detail.pageY;
	if (id == 1 || id == 2 || id == 5) {
		event.preventDefault();
		Ggrid.endEdit();
	}
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
const RESUMEN = document.getElementById("resumen").value;
const IDLAYOUT = document.getElementById("idlayout").value;
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
				columns: Tcabecera,
				dataSource: new window.Smart.DataAdapter({
					dataSource:
						"http://localhost:3000/objetivos/leototalobjetivo/" +
						IDLAYOUT,
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
					action: "doubleClick",
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
				behavior: { columnResizeMode: "growAndShrink" },
				layout: {
					rowHeight: "auto",
					allowCellsWrap: true,
				},
				appearance: {
					allowRowDetailToggleAnimation: false,
				},
				columns: Tcabecera,
				dataSource: new window.Smart.DataAdapter({
					dataSource:
						"http://localhost:3000/objetivos/leounobjetivoinicial/" +
						IDLAYOUT +
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
					console.log("Seguimos ....");
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
						console.log("Resto", resto);
						cvalor = 0;
						cvalor = parseFloat(resto) + parseFloat(absNewValue);
						console.log("CValor", resto, absNewValue, cvalor);
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
					Ggrid.refreshView();
					calculapesos(grow);
				},
			};
		}
	}
);
