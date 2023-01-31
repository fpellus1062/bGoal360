//const chartdist = document.querySelector("#chartdist");
var resumentext = [];
var datosTope = 0;
var columnaResumen = "";
var cabecera = [];
//const COLORES =  ['#ffffc7', '#ffafcc', '#ffffc7', '#ffffc7', '#ffffc7'];
const COLORES = ["#ffffc7", "default", "default", "default", "default"];
const grid = document.querySelector("#Laygrid");
$(document).ready(function () {
	const distable = document.getElementById("distable");
	const resumen = document.getElementById("resumen");
	const resumen1 = document.getElementById("resumen1");
	const resumen2 = document.getElementById("resumen2");
	const toast = document.querySelectorAll("smart-toast")[0];
	const Lfilas = [
		"id: number",
		"response: number",
		"empresa: number",
		"nombre: string",
		"ejercicio_descripcion: string",
		"codigo: string",
		"version: string",
		"descripcion: string",
		"fecha: string",
		"fechaactualizacion: string",
		"usuario: string",
		"observaciones: string",
		"accion: string",
	];
	function getChipColor(colorIndex) {
		const color = COLORES[colorIndex];
		return color;
	}

	const Lcabecera = [
		{
			label: "Id",
			dataField: "id",
			align: "right",
			cellsAlign: "center",
			dataType: "number",
			visible: false,
			cellsFormat: "n",
		},
		{
			label: "Empresa",
			dataField: "empresa",
			dataType: "string",
			allowEdit: false,
			cellsAlign: "center",
		},
		{
			label: "Nombre",
			dataField: "nombre",
			dataType: "string",
			allowEdit: false,
		},
		{
			label: "Ejercicio",
			dataField: "ejercicio_descripcion",
			dataType: "string",
			allowEdit: false,
			cellsAlign: "center",
		},
		{
			label: "Codigo",
			dataField: "codigo",
			dataType: "string",
			allowEdit: false,
			cellsAlign: "center",
		},
		{
			label: "Version",
			dataField: "version",
			dataType: "string",
			allowEdit: false,
			cellsAlign: "center",
			formatFunction(settings) {
				if (settings.row.data.version == "VP") {
					settings.template =
						'<span class="badge rounded-pill bg-primary">' +
						settings.row.data.version +
						" - Presupuesto</span>";
				}
				if (settings.row.data.version == "V1") {
					settings.template =
						'<span class="badge rounded-pill bg-success">' +
						settings.row.data.version +
						" - Optimista</span>";
				}
				if (settings.row.data.version == "V2") {
					settings.template =
						'<span class="badge rounded-pill bg-danger">' +
						settings.row.data.version +
						" - Pesimista</span>";
				}
				if (settings.row.data.version == "V3") {
					settings.template =
						'<span class="badge rounded-pill bg-warning">' +
						settings.row.data.version +
						" - Realista</span>";
				}
			},
		},
		{
			label: "Descripcion",
			dataField: "descripcion",
			dataType: "string",
			allowEdit: true,
			width: 300,
		},
		{
			label: "Fecha",
			dataField: "fecha",
			dataType: "string",
			cellsAlign: "center",
			allowEdit: false,
		},
		{
			label: "Fecha Act.",
			dataField: "fechaactualizacion",
			dataType: "string",
			cellsAlign: "left",
			allowEdit: false,
		},
		{
			label: "Usuario",
			dataField: "usuario",
			dataType: "string",
			allowEdit: false,
		},
		{
			label: "Observaciones",
			dataField: "observaciones",
			align: "left",
			dataType: "string",
			width: 300,
		},
		{
			label: "Accion",
			dataField: "accion",
			align: "center",
			cellsAlign: "center",
			allowEdit: false,

			template: function (formatObject) {
				if (!formatObject.template) {
					const data = document.createElement("span");
					const plus = document.createElement("div");
					plus.style.background = getChipColor(13);
					plus.classList.add("btn-group");
					plus.innerHTML =
						'<a class="btn btn-default" href="#"><i class="fa fa-folder-open fa_custom" title="Mantener Objetivos"></i></a> <a class="btn btn-default" href="/empresas/empresaslistado"><i class="fa fa-flag fa_custom " title="Align Center"></i> </a>';

					data.innerHTML = formatObject.value;
					data.style.marginLeft = "7px";
					plus.row = formatObject.row;

					const template = document.createElement("div");
					template.appendChild(data);
					template.appendChild(plus);
					formatObject.template = template;
					plus.addEventListener("click", () => {
						const row = plus.row;
						const idlayout = document.getElementById("idlayout");
						idlayout.value = row.data.id;
						const idversion = document.getElementById("idversion");
						idversion.value = row.data.version;
						console.log(idversion.value);
						listalayouts.submit();
					});
				} else {
					formatObject.template.firstChild.innerHTML =
						formatObject.value;
					const buttons =
						formatObject.template.querySelectorAll(".btn-group");
					buttons[0].row = formatObject.row;
				}
			},
		},
		{
			label: "campo_resumen",
			dataField: "campo_resumen",
			dataType: "string",
			visible: false,
		},
	];
	grid.messages = {
		en: {
			find: "Buscar ....",
			findInView: "Buscar ....",
			columnMenuItemSortAsc: "Ordenar {{mode}}",
			columnMenuItemSortDesc: "Ordenar {{mode}}",
			columnMenuItemRemoveSort: "Quitar Ordenacion",
		},
	};
	grid.locale = "en";

	window.Smart(
		"#Laygrid",
		class {
			get properties() {
				return {
					editing: {
						batch: false,
						enabled: true,
						action: "doubleClick",
						mode: "cell",
					},
					scrolling: "deferred",
					sorting: {
						enabled: true,
					},
					header: {
						visible: true,
						buttons: ["search"],
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
						allowRowDetailToggleAnimation: true,
						autoShowColumnFilterButton: false,
						//alternationCount: 2
					},
					columns: Lcabecera,
					dataSource: new window.Smart.DataAdapter({
						dataSource: "/objetivos/leerlayout/",
						dataSourceType: "json",
						id: "id",
						keyDataField: "id",
						parentDataField: "response",
						dataFields: Lfilas,
					}),
					onCellUpdate: function (cell, oldValue, newValue, confirm) {
						var fila = cell[0].row;
						var columna = cell[0].column.dataField;

						$.ajax({
							url: "/objetivos/updatelayout",
							type: "PUT",
							dataType: "json",
							cache: false,
							data: {
								empresa_id: fila.data.empresa,
								layout_id: fila.data.id,
								col: columna,
								newvalor: newValue,
							},
							success: function (datos) {
								if (datos) {
									toast.open();
									toast.type = "success";
									toast.value = "Fila cambiada con exito!";
								}
							},
							error: function (jqXHR, textStatus, err) {
								alert("Error " + textStatus + ", err " + err);
							},
						});
						confirm(true);
					},
				};
			}
		}
	);
	grid.addEventListener("rowExpand", function (event) {
		const detail = event.detail,
			erow = detail.row,
			eid = detail.id,
			eoriginalEvent = detail.originalEvent;
		event.preventDefault();
		grid.setRowStyle(erow.id, {
			fontFamily: "Poppins",
			background: COLORES[erow.level],
		});
		if (erow.id > 1) {
			abrirarbol(erow, false, true);
		}
		grid.refreshView();
	}),
		grid.addEventListener("rowCollapse", function (event) {
			const detail = event.detail,
				erow = detail.row,
				eid = detail.id,
				eoriginalEvent = detail.originalEvent;
			event.preventDefault();

			if (erow.level == 0) {
				grid.setRowStyle(erow.id, {
					fontFamily: "Poppins",
					background: "default",
				});
			}
		}),
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
	// Chartdist Codigo -----------------

	// Fin Chardist Codigo ---------------
	Smart(
		"#chart",
		class {
			get properties() {
				return {
					caption: "",
					description: "",
					showToolTipsOnAllSeries: true,
					showLegend: false,
					borderLineWidth: 0,
					padding: { left: 5, top: 5, right: 5, bottom: 5 },
					titlePadding: { left: 40, top: 0, right: 0, bottom: 10 },
					dataSource: [],
					xAxis: {
						dataField: "Mes",
						gridLines: {
							visible: false,
						},
					},
					colorScheme: "scheme04",
					valueAxis: {
						visible: true,
						title: { text: columnaResumen },
						tickMarks: { color: "#6B1CB0" },
					},
					seriesGroups: [
						{
							type: "column",
							columnsGapPercent: 50,
							seriesGapPercent: 0,
							showLabels: false,
							valueAxis: {
								unitInterval: 0,
								minValue: 0,
								maxValue: "auto",
								description: columnaResumen,
								axisSize: "auto",
								formatSettings: {
									thousandsSeparator: ".",
									decimalSeparator: ",",
								},
							},

							series: [
								{
									dataField: "Valor",
									displayText: "Objetivo",
									labels: {
										formatSettings: {
											thousandsSeparator: ".",
											decimalSeparator: ",",
										},
									},
									colorFunction: function (
										value,
										itemIndex,
										serie,
										group
									) {
										return itemIndex == 0
											? "#E74C3C"
											: "#375D81";
									},
								},
							],
						},
					],
				};
			}
		}
	);
});
//Abrimos el arbol a partir de la fila, indicada, todos sus hijos (true / false) y color
var abrirarbol = function (fila, all, color) {
	grid.beginUpdate();
	grid.expandRow(fila.id);
	grid.setRowStyle(fila.id, {
		fontFamily: "Poppins",
		background: COLORES[fila.level],
	});
	fila.children.forEach((hijo) => {
		if (color) {
			//grid.setRowStyle(hijo.id,{	fontFamily: "Poppins","background":COLORES[hijo.level],"color": "purple"});
			grid.setRowStyle(hijo.id, {
				fontFamily: "Poppins",
				background: COLORES[hijo.level],
				color: "default",
			});
		}
		if (hijo.children.length > 0 && all) {
			abrirarbol(hijo, true, color);
		}
	});
	grid.endUpdate();
	return;
};
grid.addEventListener("rowClick", function (event) {
	const detail = event.detail,
		row = detail.row,
		originalEvent = detail.originalEvent,
		id = detail.id,
		isRightClick = detail.isRightClick,
		pageX = detail.pageX,
		pageY = detail.pageY;
	var campos = "";
	var niveles = "";
	var filaid = row.data.id;
	grid.refreshView();
	$("#progressbar").css("width", "0" + "%");
	var campos = "";
	var filaid = "";
	var filas = grid.getSelectedRows();
	if (filas.length > 0) {
		filaid = filas[0][1];
	} else {
		grid.selectRows([1]);
		filas = grid.getSelectedRows();
		filaid = filas[0][1];
	}

	$.ajax({
		url: "/objetivos/resumenlayout",
		type: "GET",
		dataType: "json",
		cache: false,
		data: { empresa_id: filaid.empresa, layout_id: filaid.id },
		success: function (datos) {
			resumentext = datos;
			columnaResumen = resumentext[0].campo_resumen;
			console.log(resumentext);
			for (var i = 0; i < resumentext.length; i++) {
				campos +=
					"<tr><td>" +
					resumentext[i].nivel +
					"</td>" +
					"<td>" +
					resumentext[i].descripcion +
					"</td>" +
					'<td  class="text-center">' +
					resumentext[i].count +
					"</td></tr>";
			}

			resumen.dataSource = {
				linea1: "",
				linea2:
					'<div><table class="table" ></tr> <th> Nivel </th> <th> Campo </th>  <th class="text-center"> # Reg. x Nivel </th></tr>' +
					campos +
					"</table> </div>",
				linea3: "",
			};
			$.ajax({
				url: "/objetivos/leerlayoutgrafico",
				type: "GET",
				dataType: "json",
				cache: false,
				data: { empresa_id: filaid.empresa, layout_id: filaid.id },
				success: function (datos) {
					$("#progressbar").css("width", "25" + "%");
					chart.caption =
						"Datos Agrupado por " +
						" X  " +
						resumentext[0].descripcion;
					chart.description = "en " + columnaResumen;
					chart.dataSource = datos;
					chart.update();
					chart.refresh();
				},
				error: function (jqXHR, textStatus, err) {
					alert("Error " + textStatus + ", err " + err);
				},
			});
			$.ajax({
				url: "/objetivos/distribucion",
				type: "GET",
				dataType: "json",
				cache: false,
				data: {
					empresa_id: filaid.empresa,
					layout_id: filaid.id,
					nivel_id: 1,
					version: filaid.version,
				},
				success: function (data) {
					var nivel = "# " + resumentext[0].descripcion;
					cabecera = [
						{
							label: columnaResumen,
							dataField: "Intervalo",
							dataType: "string",
							with: 60,
						},
						{
							label: nivel,
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
									className =
										"badge rounded-pill text-bg-success";
								} else if (value >= 20) {
									className =
										"badge rounded-pill text-bg-info";
								} else {
									className =
										"badge rounded-pill text-bg-secondary";
								}
								settings.template = `<span class="${className}">${value}%</span>`;
							},
						},
					];
					console.log("Datos: ", data);

					distable.dataSource = data;
					distable.columns = cabecera;
					distable.refresh();
					$("#progressbar").css("width", "100" + "%");
				},
				error: function (jqXHR, textStatus, err) {
					alert("Error " + textStatus + ", err " + err);
				},
			});
		},
		error: function (jqXHR, textStatus, err) {
			alert("Error " + textStatus + ", err " + err);
		},
	});
});
