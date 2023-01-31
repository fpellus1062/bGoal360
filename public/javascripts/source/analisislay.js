const COLORS = [
	"#4424d4",
	"#6841df",
	"#8c5fe9",
	"#b07cf4",
	"#d49aff",
	"#2D660A",
	"#144D14",
	"#0A3C02",
	"#0C2808",
	"#020301",
	"#28ffc7",
	"#00a77b",
	"#FFFFFF",
];
var resumentext = [];
var datosTope = 0;
var columnaResumen = [];

var cabecera = [];
var cabecerapareto = [];
var listalay = [];

window.onload = function () {
	const resumen = document.getElementById("resumen");
	const resumen1 = document.getElementById("resumen1");
	const resumen2 = document.getElementById("resumen2");
	const distable = document.getElementById("distable");
	const idlayout = document.getElementById("idlayout");
	const imprime = document.getElementById("imp");
	const imprime1 = document.getElementById("imp1");
	const imprime2 = document.getElementById("imp2");
	const chart = document.getElementById("chart");
	const chart1 = document.getElementById("chart1");
	const chart2 = document.getElementById("chart2");
	const resumenlayout = document.getElementById("resumenlayout");
	const paretolayout = document.getElementById("paretolayout");
	const buttons = document.querySelectorAll("smart-radio-button");

	var tooltipTriggerList = [].slice.call(
		document.querySelectorAll('[data-bs-toggle="tooltip"]')
	);
	var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
		return new bootstrap.Tooltip(tooltipTriggerEl);
	});

	for (let i = 0; i < buttons.length; i++) {
		console.log(buttons[i]);
		buttons[i].addEventListener("change", function (event) {
			const checkStatus = event.detail.value;
		});
	}
	idlayout.resizeMode = "both";
	var nivel = "";
	imprime2.addEventListener("click", function (event) {
		chart2.saveAsPNG(nivel + "_ChartPie.png", "landscape");
	});
	imprime.addEventListener("click", function (event) {
		chart.saveAsPDF(nivel + "_ChartDist.pdf", "landscape");
	});
	imprime1.addEventListener("click", function (event) {
		chart1.saveAsPDF(nivel + "_ChartBar.pdf", "landscape");
	});
	resumenlayout.addEventListener("cellClick", function (event) {
		const detail = event.detail,
			id = detail.id,
			dataField = detail.dataField,
			row = detail.row,
			value = detail.value,
			originalEvent = detail.originalEvent;
		var ultimonivel = "";
		ultimonivel = row.nivel;
		nivel = row.descripcion;
		$("#progressbar").css("width", "0" + "%");
		actualizar(nivel, ultimonivel);
	});
};
$(document).ready(function () {
	const toast = document.querySelectorAll("smart-toast")[0];
	var datos = [];

	function getChipColor(colorIndex) {
		const color = COLORS[colorIndex];
		return color;
	}
	var lista = [];
	var elemento = {};

	$.ajax({
		url: "/objetivos/leerlayout/",
		type: "GET",
		dataType: "json",
		cache: false,
		data: { id: 0 },
		success: function (lays) {
			listalay = lays;
			for (var i = 0; i < lays.length; i++) {
				elemento.label =
					lays[i].codigo +
					"- " +
					lays[i].version +
					"-" +
					lays[i].nombre +
					"-" +
					lays[i].descripcion +
					"-" +
					lays[i].observaciones +
					"-" +
					lays[i].campo_resumen;
				elemento.value = lays[i].id;
				elemento.group = lays[i].codigo;
				columnaResumen[lays[i].id] = lays[i].campo_resumen;
				lista.push(elemento);
				elemento = {};
			}
			idlayout.dataSource = lista;
		},
		error: function (jqXHR, textStatus, err) {
			alert("Error " + textStatus + ", err " + err);
		},
	});

	Smart(
		"#chart",
		class {
			get properties() {
				return {
					animation: "none",
					clip: false,
					caption: "",
					description: "",
					showLegend: true,
					borderLineWidth: 0,
					padding: { left: 0, top: 2, right: 0, bottom: 5 },
					titlePadding: { left: 40, top: 0, right: 0, bottom: 10 },
					colorScheme: "scheme04",
					showToolTipsOnAllSeries: true,
					enableCrosshairs: true,
					dataSource: datos,
					xAxis: {
						dataField: "Clave",
						valuesOnTicks: true,
						visible: false,
					},
					valueAxis: {
						title: { text: "Objetivo" },
						// unitInterval: 10000,
						formatSettings: {
							decimalPlaces: 1,
						},
					},
					seriesGroups: [
						{
							type: "scatter",
							series: [
								{
									dataField: "Objetivo",
									symbolSize: 3,
									symbolType: "circle",
									displayText: "Objetivo",
								},
							],
						},
					],
				};
			}
		}
	);
	Smart(
		"#chart1",
		class {
			get properties() {
				return {
					caption: "",
					description: "",
					showToolTipsOnAllSeries: false,
					showLegend: true,
					borderLineWidth: 0,
					padding: { left: 5, top: 2, right: 5, bottom: 5 },
					titlePadding: { left: 40, top: 0, right: 0, bottom: 10 },
					dataSource: [],
					xAxis: {
						dataField: "Mes",
						gridLines: {
							visible: true,
						},
					},
					colorScheme: "scheme04",
					valueAxis: {
						visible: true,
						formatSettings: {
							decimalPlaces: 1,
						},
						title: { text: "Cambiarlo" },
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
								description: "Objetivo",
								axisSize: "auto",
							},
							series: [
								{
									dataField: "Valor",
									displayText: "Objetivo",
									labels: { visible: false },
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
	Smart(
		"#chart2",
		class {
			get properties() {
				return {
					caption: "",
					description: "",
					showToolTipsOnAllSeries: true,
					showLegend: true,
					borderLineWidth: 0,
					padding: { left: 5, top: 2, right: 5, bottom: 5 },
					titlePadding: { left: 40, top: 0, right: 0, bottom: 10 },
					dataSource: [],
					seriesGroups: [
						{
							type: "pie",
							showLabels: true,
							series: [
								{
									dataField: "Valor",
									displayText: "Mes",
									labelRadius: 100,
									initialAngle: 0,
									radius: 75,
									centerOffset: 5,
									formatFunction: function (value) {
										if (isNaN(value)) {
											// Legend labels formatting
											return value;
										}
										return (
											parseFloat(value).toFixed(2) + "%"
										);
									},
									useGradientColors: false,
								},
							],
						},
					],
				};
			}
		}
	);

	window.Smart(
		"#resumenlayout",
		class {
			get properties() {
				return {
					dataSource: new window.Smart.DataAdapter({
						dataSource: [],
						dataFields: [
							"nivel: number",
							"descripcion: string",
							"count: number",
						],
					}),
					columnResize: true,
					columnResizeFeedback: true,
					freezeHeader: true,
					selection: true,
					columns: [
						{
							label: "Nivel",
							dataField: "nivel",
							dataType: "number",
							align: "center",
							with: 30,
						},
						{
							label: "Descripcion",
							dataField: "descripcion",
							dataType: "string",
						},
						{
							label: "Registros",
							dataField: "count",
							dataType: "number",
							formatFunction(settings) {
								settings.template = `<span class="badge rounded-pill text-bg-success">${settings.value}</span>`;
							},
						},
					],
				};
			}
		}
	);
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
	window.Smart(
		"#paretolayout",
		class {
			get properties() {
				return {
					conditionalFormatting: [
						{
							column: "total",
							condition: "lessThan",
							firstValue: 5000,
							text: "#6AA84F",
							highlight: COLORS[3],
						},
					],
					dataSource: new window.Smart.DataAdapter({
						dataSource: [],
						dataFields: [
							"literal: string",
							"total: string",
							"percent: number",
							"posicion: number",
						],
					}),
					columnResize: true,
					columnResizeFeedback: true,
					freezeHeader: true,
					columns: cabecerapareto,
				};
			}
		}
	);
});

//----------- FIN click -----------------
idlayout.addEventListener("change", async function (event) {
	fetch("http://localhost:3000/objetivos/leerniveleslayout", {
		method: "POST",
		headers: {
			"Content-Type": "application/json;charset=utf-8",
		},
		body: JSON.stringify({ layout_id: event.detail.value }),
	})
		.then((response) => response.json())

		.then((data) => {
			actualizar(data.esquema[1], data.nivel[0]);
		})
		.catch((error) => {
			console.error("Error:", error);
		});
	$.ajax({
		url: "/objetivos/resumenlayout",
		type: "GET",
		dataType: "json",
		cache: false,
		data: { layout_id: idlayout.value[0].value },
		success: function (datoslayout) {
			resumenlayout.dataSource = datoslayout;
			resumenlayout.render();
		},
		error: function (jqXHR, textStatus, err) {
			alert("Error " + textStatus + ", err " + err);
		},
	});
});

function actualizar(nivel, ultimonivel) {
	distable.hidden = true;
	let indices = idlayout.selectedIndexes;

	$.ajax({
		url: "/objetivos/analisislay",
		type: "POST",
		dataType: "json",
		cache: false,
		data: {
			empresa_id: "2",
			layout_id: idlayout.value[0].value,
			nivel_id: ultimonivel,
		},
		success: function (data) {
			chart.dataSource = data;
			chart.caption = "Dispersion de Valores por:";
			chart.description = nivel;
			chart.update();
			chart.refresh();
			$("#progressbar").css("width", "0" + "%");
		},
		error: function (jqXHR, textStatus, err) {
			alert("Error " + textStatus + ", err " + err);
		},
	});
	$.ajax({
		url: "/objetivos/leerlayoutgrafico",
		type: "GET",
		dataType: "json",
		cache: false,
		data: { layout_id: idlayout.value[0].value },
		success: function (datos) {
			$("#progressbar").css("width", "50" + "%");
			chart1.caption = "Valores";
			chart1.description =
				"en " + columnaResumen[idlayout.value[0].value];
			chart1.dataSource = datos;
			chart1.update();
			chart1.refresh();
			//----------------------------------------------------------------
		},
		error: function (jqXHR, textStatus, err) {
			alert("Error " + textStatus + ", err " + err);
		},
	});
	$.ajax({
		url: "/objetivos/leerlayoutgraficopie",
		type: "GET",
		dataType: "json",
		cache: false,
		data: { layout_id: idlayout.value[0].value },
		success: function (datospie) {
			chart2.caption = "Valores";
			chart2.description =
				"en % " + columnaResumen[idlayout.value[0].value];
			chart2.dataSource = datospie;
			chart2.update();
			chart2.refresh();
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
			layout_id: idlayout.value[0].value,
			nivel_id: ultimonivel,
			version: listalay[indices[0]].version,
		},
		success: function (datosdist) {
			cabecera = [
				{
					label: columnaResumen[idlayout.value[0].value],
					dataField: "Intervalo",
					dataType: "string",
					with: 60,
				},
				{
					label: "# " + nivel,
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
			distable.hidden = false;
			distable.dataSource = datosdist;
			distable.columns = cabecera;
			$("#progressbar").css("width", "100" + "%");
			distable.refresh();
		},
		error: function (jqXHR, textStatus, err) {
			alert("Error " + textStatus + ", err " + err);
		},
	});
	$.ajax({
		url: "/objetivos/pareto",
		type: "GET",
		dataType: "json",
		cache: false,
		data: {
			empresa_id: "2",
			layout_id: idlayout.value[0].value,
			nivel_id: ultimonivel,
			version: listalay[indices[0]].version,
		},
		success: function (datospareto) {
			cabecerapareto = [
				{
					label: nivel,
					dataField: "literal",
					dataType: "string",
					width: 120,
					formatFunction(settings) {
						if (settings.value == "") {
							settings.template = `<b><span class="red">RESUMEN </span></b>`;
						}
					},
				},
				{
					label: columnaResumen[idlayout.value[0].value],
					dataField: "total",
					dataType: "string",
					align: "right",
					formatFunction(settings) {
						if (settings.value == 0) {
							settings.template = `<b><span class="red">  ${
								columnaResumen[idlayout.value[0].value]
							}</span><b>`;
						}
					},
				},
				{
					label: "#",
					dataField: "posicion",
					dataType: "string",
					align: "right",
					formatFunction(settings) {
						if (settings.value == 0) {
							settings.template = `<b><span class="red"> # </span></b>`;
						}
					},
				},
				{
					label: "Peso",
					dataField: "percent",
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
						settings.template = `<span class="${className}">${value.toFixed(
							2
						)}%</span>`;
						if (value == 0) {
							settings.template = `<b><span class="red">Peso</span></b>`;
						}
					},
				},
			];
			paretolayout.dataSource = datospareto;
			paretolayout.columns = cabecerapareto;
			paretolayout.refresh();
		},
		error: function (jqXHR, textStatus, err) {
			alert("Error " + textStatus + ", err " + err);
		},
	});
}
