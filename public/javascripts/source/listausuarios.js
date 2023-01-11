const form = document.getElementById("listausuarios");
const ugrid = document.querySelector("#Usugrid");
const idempresas = document.getElementById("idempresas");
var patern =
	/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g;
var USUARIO_ID = "";
var BAJA = "";
const colors = [
	"#FA5B0F",
	"#B4E051",
	"#8CD211",
	"#5AA700",
	"#4C8400",
	"#2D660A",
	"#144D14",
	"#0A3C02",
	"#0C2808",
	"#020301",
	"#28ffc7",
	"#00a77b",
	"#FFFFFF",
];
const toast = document.querySelectorAll("smart-toast")[0];

const Lfilas = [
	"id: number",
	"nombre: string",
	"apellido1: string",
	"apellido2: string",
	"email: string",
	"empresas: string",
	"bloqueado: string",
	"fechacreacion: date",
	"fechaactualizacion: date",
	"fechabaja: date",
	"comentarios: string",
];

$(document).ready(function () {
	$("#idempresa").attr("disabled", "disable");
	const newBtn = document.getElementById("newBtn");
	const fechas = document.getElementsByTagName("smart-date-time-picker");

	var tooltipTriggerList = [].slice.call(
		document.querySelectorAll('[data-bs-toggle="tooltip"]')
	);
	var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
		return new bootstrap.Tooltip(tooltipTriggerEl);
	});
	var lista = [];
	var elemento = {};

	$.ajax({
		url: "/empresas/listaempresasconfig/",
		type: "POST",
		dataType: "json",
		cache: false,
		data: { id: 0 },
		success: function (empresas) {
			console.log(empresas);
			for (var i = 0; i < empresas.length; i++) {
				elemento.label =
					empresas[i].empresa_id + " - " + empresas[i].nombre;
				elemento.value = empresas[i].id;
				lista.push(elemento);
				elemento = {};
			}
			idempresas.dataSource = lista;
		},
		error: function (jqXHR, textStatus, err) {
			alert("Error " + textStatus + ", err " + err);
		},
	});
	for (var i = 0; i < fechas.length; i++) {
		fechas[i].dropDownDisplayMode = "calendar";
		fechas[i].formatString = "d2";
		fechas[i].messages.es = {
			now: "Hoy",
			dateTabLabel: "Fecha",
			timeTabLabel: "Hora",
		};
		fechas[i].locale = "es";
		fechas[i].firstDayOfWeek = 1;
	}

	function getChipColor(colorIndex) {
		const color = colors[colorIndex];
		return color;
	}

	const Lcabecera = [
		{
			label: "Codigo",
			dataField: "id",
			cellsAlign: "left",
			dataType: "number",
			allowEdit: false,
			width: 100,
			description: "Codigo de Usuario",
		},
		{
			label: "Nombre",
			dataField: "nombre",
			dataType: "string",
			validationRules: [
				{ type: "required" },
				{ type: "minLength", value: 3 },
			],
			width: 200,
		},
		{
			label: "Apellido 1",
			dataField: "apellido1",
			dataType: "string",
			validationRules: [
				{ type: "required" },
				{ type: "minLength", value: 3 },
			],
			width: 200,
		},
		{
			label: "Apellido 2",
			dataField: "apellido2",
			dataType: "string",
			validationRules: [
				{ type: "required" },
				{ type: "minLength", value: 3 },
			],
			width: 200,
		},
		{
			label: "ID Usuario (Email) ",
			dataField: "email",
			dataType: "string",
			template: "email",
			allowEdit: false,
			validationRules: [
				{ type: "required" },
				{ type: "minLength", value: 6 },
			],
			width: 200,
		},
		{
			label: "Empresas",
			width: 400,
			dataField: "empresas",
			template: "tags",
			editor: {
				template: "multiComboInput",
				dataSource: lista,
			},
		},
		{
			label: "Bloqueado",
			width: 100,
			dataField: "bloqueado",

			editor: {
				template: "dropDownList",
				dataSource: ["S", "N"],
			},
			cellsAlign: "center",
			validationRules: [{ type: "required" }],
		},
		{
			label: "Fecha Alta",
			dataField: "fechacreacion",
			align: "center",
			cellsAlign: "center",
			cellsFormat: "d2",
			allowEdit: false,
			editor: {
				template: "dateTimePicker",
				formatString: "d2",
				onInit(index, dataField, editor) {
					editor.messages.es = {
						now: "Hoy",
						dateTabLabel: "Fecha",
						timeTabLabel: "Hora",
					};
					editor.locale = "es";
					editor.firstDayOfWeek = 1;
					editor.placeholder = "Fecha Alta ...";
					editor.nullable = true;
				},
			},
		},
		{
			label: "Fecha Actualizacion",
			dataField: "fechaactualizacion",
			align: "center",
			cellsAlign: "center",
			cellsFormat: "d2",
			allowEdit: false,
			editor: {
				template: "dateTimePicker",
				formatString: "d2",
				onInit(index, dataField, editor) {
					editor.messages.es = {
						now: "Hoy",
						dateTabLabel: "Fecha",
						timeTabLabel: "Hora",
					};
					editor.locale = "es";
					editor.firstDayOfWeek = 1;
					editor.placeholder = "Fecha Actualizacion ...";
				},
			},
		},
		{
			label: "Fecha Baja",
			dataField: "fechabaja",
			align: "center",
			cellsAlign: "center",
			cellsFormat: "d2",
			allowEdit: false,
			editor: {
				template: "dateTimePicker",
				formatString: "d2",
				onInit(index, dataField, editor) {
					editor.messages.es = {
						now: "Hoy",
						dateTabLabel: "Fecha",
						timeTabLabel: "Hora",
					};
					editor.locale = "es";
					editor.firstDayOfWeek = 1;
					editor.placeholder = "Fecha Baja ...";
				},
			},
		},
		{
			label: "Accion",
			dataField: "accion",
			align: "center",
			cellsAlign: "center",
			width: 80,
			allowEdit: false,
			template: function (formatObject) {
				if (!formatObject.template) {
					const data = document.createElement("span");
					const baja = document.createElement("div");
					baja.style.background = getChipColor(13);
					baja.classList.add("btn-group");
					baja.innerHTML =
						'<a class="btn btn-default" href="#"><i class="fas fa-exchange-alt fa_custom" title="Dar de Alta / Baja del Usuario"></i></a>';
					data.innerHTML = formatObject.value;
					data.style.marginLeft = "7px";
					baja.row = formatObject.row;
					const template = document.createElement("div");
					template.appendChild(data);
					template.appendChild(baja);
					formatObject.template = template;
					baja.addEventListener("click", () => {
						const row = baja.row;
						const fechabaja = row.data.fechabaja;

						ugrid.beginUpdate();

						if (dardebaja(row.data.id, fechabaja)) {
							if (fechabaja != null) {
								ugrid.setCellValue(
									row.data.id,
									"fechabaja",
									null
								);
							} else {
								ugrid.setCellValue(
									row.data.id,
									"fechabaja",
									new Date()
								);
							}
							//ugrid.setCellValue(row.data.id,'fechabaja',( (fechabaja != '' && fechabaja != null) ? '': new Date()));
							toast.closeLast();
							toast.open();
							toast.type = "success";
							toast.value = "Operacion realizada con exito!";
						} else {
							toast.closeLast();
							toast.open();
							toast.type = "error";
							toast.value = "Error de Baja!";
							ugrid.setCellValue(
								row.data.id,
								"fechabaja",
								fechabaja
							);
						}
						//}
						ugrid.endUpdate();
					});
				}
			},
		},
	];
	ugrid.messages = {
		en: {
			find: "Buscar ....",
			findInView: "Buscar ....",
			columnMenuItemSortAsc: "Ordenar {{mode}}",
			columnMenuItemSortDesc: "Ordenar {{mode}}",
			columnMenuItemRemoveSort: "Quitar Ordenacion",
			expandRow: "Abrir Fila",
			collapseRow: "Cerrar Fila",
			found: "Resultados",
			invalidCellValue:
				'Valor "{{value}}",: no válido. Reglas de Validacion: "{{validationRule}}"".',
		},
	};
	ugrid.locale = "en";
	window.Smart(
		"#Usugrid",
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
						dataSource: "/usuarios/listausuarios/",
						dataSourceType: "json",
						type: "GET",
						id: "id",
						dataFields: Lfilas,
					}),
					rowDetail: {
						enabled: true,
						visible: true,
						height: 140,
						template: `<div class="card">
                  <div id = "cabecera" class="card-header"><h5>{{nombre}}</h5></div>
                  <div class="card-body">{{comentarios}}</div>
                  <div class="card-footer"></div>
                </div>`,
					},
					onRowUpdate: function (
						index,
						row,
						oldValues,
						newValues,
						confirm
					) {
						confirm(true);
					},
					onCellUpdate: function (cell, oldValue, newValue, confirm) {
						var fila = cell[0].row;
						var columna = cell[0].column.dataField;
						if (oldValue === newValue) {
							confirm(false);
						}

						if (columna == "email") {
							let correo = newValue.toString();
							if (
								correo != null &&
								correo.match(patern) === null
							) {
								toast.closeLast();
								toast.open();
								toast.type = "error";
								toast.value =
									"Direccion correo incorrecta! " + newValue;
								confirm(false);
							}
						}
						//Convertimos a Locale UTC
						if (cell[0].column.label.slice(0, 5) == "Fecha") {
							newValue = newValue.toLocaleString("es-ES", "sort");
						}
						$.ajax({
							url: "/usuarios/updateusuarios",
							type: "PUT",
							dataType: "json",
							cache: false,
							data: {
								usuario_id: fila.data.id,
								col: columna,
								newvalor: newValue,
							},
							success: function (datos) {
								if (datos == 1) {
									toast.closeLast();
									toast.open();
									toast.type = "success";
									toast.value =
										"Operacion realizada con exito!";
									confirm(true);
									ugrid.update();
								} else {
									toast.closeLast();
									toast.open();
									toast.type = "error";
									toast.value =
										"Error de Actualizacion! en el campo: " +
										columna;
									confirm(false);
								}
							},
							error: function (jqXHR, textStatus, err) {
								toast.closeLast();
								toast.open();
								toast.type = "error";
								toast.value =
									"Error de Actualizacion! en el campo: " +
									columna +
									textStatus +
									", err " +
									err;
								confirm(false);
							},
						});
					},
				};
			}
		}
	);
});
ugrid.addEventListener("rowClick", function (event) {
	const detail = event.detail,
		row = detail.row,
		originalEvent = detail.originalEvent,
		id = detail.id,
		isRightClick = detail.isRightClick,
		pageX = detail.pageX,
		pageY = detail.pageY;
	USUARIO_ID = row.data.id;
});

function dardebaja(id, fechabaja) {
	$.ajax({
		url: "/usuarios/deleteusuarios",
		type: "PUT",
		dataType: "json",
		cache: false,
		data: { usuario_id: id, newvalor: fechabaja },
		success: function (datos) {
			ugrid.update();
		},
		error: function (jqXHR, textStatus, err) {
			alert("Error " + textStatus + ", err " + err);
			return false;
		},
	});
	return true;
}
// newBtn.addEventListener  ('click', function(event)  {
//   if (dardealta()) {
//     ugrid.refresh();
//   }

// });
$("#idemail").blur(function () {
	var mail = $("#idemail").val();

	if (mail != null && mail.match(patern) === null) {
		toast.closeLast();
		toast.open();
		toast.type = "error";
		toast.value = "Direccion correo incorrecta! " + $("#idemail").val();
	} else {
		toast.closeAll();
	}
});

listausuarios.onsubmit = async (e) => {
	e.preventDefault();
	var datos = {};
	datos.nombre = $("#nombre").val();
	datos.apellido1 = $("#apellido1").val();
	datos.apellido2 = $("#apellido2").val();
	datos.email = $("#idemail").val();

	datos.comentarios = $("#observaciones").val();
	datos.empresas = idempresas.selectedValues;

	if (datos.email != null && datos.email.match(patern) === null) {
		toast.open();
		toast.type = "error";
		toast.value = "Direccion correo incorrecta! " + $("#idemail").val();
		$("#idemail").focus();
		return false;
	} else {
		toast.closeAll();
	}

	fetch("/usuarios/usuariosalta", {
		method: "put",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(datos),
	})
		.then((response) => response.json())

		.then((data) => {
			console.log("Success:", data);
			if (!isNumber(data)) {
				toast.open();
				toast.type = "error";
				toast.value = "Error de Inserccion! " + data;
			} else {
				toast.closeLast();
				toast.open();
				toast.type = "success";
				toast.value = "Usuario insertado con exito!";
				ugrid.dataSource = new window.Smart.DataAdapter({
					dataSource: "/usuarios/listausuarios/",
					dataSourceType: "json",
					type: "GET",
					id: "id",
					dataFields: Lfilas,
				});
				ugrid.update();
			}
		})
		.catch((error) => {
			console.error("Error:", error);
		});
};
var isNumber = function isNumber(value) {
	return typeof value === "number" && isFinite(value);
};
