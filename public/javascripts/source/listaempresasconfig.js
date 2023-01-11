const form = document.getElementById("listaempconf");
const egrid = document.querySelector("#Empgrid");
var EMPRESA_ID = "";
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
	"empresa_id: number",
	"nombre: string",
	"ejercicio_descripcion: string",
	"ejercicio_inicio: date",
	"ejercicio_fin: date",
	"path: string",
	"usercreate: number",
	"userupdate: number",
	"datealta: date",
	"dateactualizacion: date",
	"datebaja: date",
];

$(document).ready(function () {
	const newBtn = document.getElementById("newBtn");
	const fechas = document.getElementsByTagName("smart-date-time-picker");
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
			label: "Empresa",
			dataField: "empresa_id",
			cellsAlign: "right",
			dataType: "number",
			allowEdit: false,
			width: 100,
			description: "Codigo de la Empresa",
		},
		{
			label: "Nombre",
			dataField: "nombre",
			dataType: "string",
			validationRules: [
				{ type: "required" },
				{ type: "minLength", value: 5 },
			],
			width: 400,
		},
		// {
		//   label: 'Ejercicio', dataField: 'ejercicio_descripcion', align: 'center',dataType: 'string', validationRules: [{ type: 'required' }, { type: 'minLength', value: 4 }],width: 50
		// },
		// {
		//   label: 'Fecha Inicio', dataField: 'ejercicio_inicio',align: 'center',cellsAlign: 'center',cellsFormat: 'd2', validationRules: [{ type: 'required' }],editor: {
		//     template: 'dateTimePicker',
		//     formatString: 'd2',
		//     onInit(index, dataField, editor) {
		//       editor.messages.es = { now: 'Hoy', dateTabLabel: 'Fecha', timeTabLabel: 'Hora' };
		//       editor.locale = 'es';
		//       editor.firstDayOfWeek = 1;
		//       editor.placeholder = "Inicio Ejercicio ...";
		//       editor.nullable = true;
		//     }
		// }
		// },
		// {
		//   label: 'Fecha Fin', dataField: 'ejercicio_fin', align: 'center',cellsAlign: 'center',cellsFormat: 'd2',validationRules: [{ type: 'required' }],editor: {
		//     template: 'dateTimePicker',
		//     formatString: 'd2',
		//     onInit(index, dataField, editor) {
		//       editor.messages.es = { now: 'Hoy', dateTabLabel: 'Fecha', timeTabLabel: 'Hora' };
		//       editor.locale = 'es';
		//       editor.firstDayOfWeek = 1;
		//       editor.placeholder = "Fin Ejercicio ...";
		//     }
		// }
		// },
		{
			label: "Datos en",
			dataField: "path",
			dataType: "string",
			align: "center",
			cellsAlign: "center",
			validationRules: [
				{ type: "required" },
				{ type: "minLength", value: 8 },
			],
			width: 500,
		},
		{
			label: "Alta",
			dataField: "datealta",
			dataType: "date",
			align: "center",
			cellsAlign: "center",
			allowEdit: false,
			cellsFormat: "d2",
		},

		{
			label: "Actualizada",
			dataField: "dateactualizacion",
			dataType: "date",
			align: "center",
			cellsAlign: "center",
			allowEdit: false,
			cellsFormat: "d2",
		},
		{
			label: "Fecha Baja",
			dataField: "datebaja",
			dataType: "date",
			cellsFormat: "d2",
			align: "center",
			cellsAlign: "center",
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
				},
			},
		},
		{
			label: "Accion",
			dataField: "accion",
			align: "center",
			cellsAlign: "center",
			width: 150,
			allowEdit: false,
			template: function (formatObject) {
				if (!formatObject.template) {
					const data = document.createElement("span");
					const baja = document.createElement("div");
					baja.style.background = getChipColor(13);
					baja.classList.add("btn-group");
					baja.innerHTML =
						'<a class="btn btn-default" href="#"><i class="fas fa-exchange-alt fa_custom" title="Dar de Alta / Baja la Empresa"></i></a>';
					data.innerHTML = formatObject.value;
					data.style.marginLeft = "7px";
					baja.row = formatObject.row;
					const template = document.createElement("div");
					template.appendChild(data);
					template.appendChild(baja);
					formatObject.template = template;
					baja.addEventListener("click", () => {
						const row = baja.row;
						const datebaja = row.data.datebaja;

						egrid.beginUpdate();

						if (dardebaja(row.data.id, datebaja)) {
							if (datebaja != null) {
								egrid.setCellValue(
									row.data.id,
									"datebaja",
									null
								);
							} else {
								egrid.setCellValue(
									row.data.id,
									"datebaja",
									new Date()
								);
							}
							//egrid.setCellValue(row.data.id,'datebaja',( (datebaja != '' && datebaja != null) ? '': new Date()));
							toast.open();
							toast.type = "success";
							toast.value = "Operacion realizada con exito!";
						} else {
							toast.open();
							toast.type = "error";
							toast.value = "Error de Baja!";
							egrid.setCellValue(
								row.data.id,
								"datebaja",
								datebaja
							);
						}
						//}
						egrid.endUpdate();
					});
				}
			},
		},
	];
	egrid.messages = {
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
	egrid.locale = "en";
	window.Smart(
		"#Empgrid",
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
					},
					behavior: { columnResizeMode: "growAndShrink" },
					layout: {
						rowHeight: "auto",
						rowMinHeight: 40,
						allowCellsWrap: true,
					},
					appearance: {
						allowRowDetailToggleAnimation: true,
						autoShowColumnFilterButton: true,
					},
					columns: Lcabecera,
					dataSource: new window.Smart.DataAdapter({
						dataSource: "/empresas/listaempresasconfig/",
						dataSourceType: "json",
						type: "POST",
						id: "id",
						dataFields: Lfilas,
					}),
					onCellUpdate: function (cell, oldValue, newValue, confirm) {
						var fila = cell[0].row;
						var columna = cell[0].column.dataField;
						if (oldValue === newValue) {
							confirm(false);
						}
						//Convertimos a Locale UTC
						if (cell[0].column.label.slice(0, 5) == "Fecha") {
							newValue = newValue.toLocaleString("es-ES", "sort");
						}
						$.ajax({
							url: "/empresas/updateempresaconfig",
							type: "PUT",
							dataType: "json",
							cache: false,
							data: {
								empresa_id: fila.data.id,
								col: columna,
								newvalor: newValue,
							},
							success: function (datos) {
								if (datos == 1) {
									toast.open();
									toast.type = "success";
									toast.value =
										"Operacion realizada con exito!";
									confirm(true);
									egrid.beginUpdate();
									egrid.refresh();

									egrid.endUpdate();
								} else {
									toast.open();
									toast.type = "error";
									toast.value =
										"Error de Actualizacion! en el campo: " +
										columna;
									confirm(false);
								}
							},
							error: function (jqXHR, textStatus, err) {
								alert("Error " + textStatus + ", err " + err);
							},
						});
					},
				};
			}
		}
	);
});
egrid.addEventListener("rowClick", function (event) {
	const detail = event.detail,
		row = detail.row,
		originalEvent = detail.originalEvent,
		id = detail.id,
		isRightClick = detail.isRightClick,
		pageX = detail.pageX,
		pageY = detail.pageY;
	EMPRESA_ID = row.data.id;
});

function dardebaja(id, datebaja) {
	$.ajax({
		url: "/empresas/deleteempresaconfig",
		type: "PUT",
		dataType: "json",
		cache: false,
		data: { empresa_id: id, newvalor: datebaja },
		success: function (datos) {
			//   egrid.beginUpdate();
			//   egrid.dataSource = new window.Smart.DataAdapter({
			//     dataSource:   '/empresas/listaempresasconfig/',
			//     dataSourceType: 'json',
			//     type: 'POST',
			//     id: 'id',
			//     dataFields: Lfilas
			// });
			// egrid.endUpdate();
			egrid.update();
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
//     egrid.refresh();
//   }

// });
listaempconf.onsubmit = async (e) => {
	e.preventDefault();

	var datos = {};
	datos.empresa_id = $("#empresa_id").val();
	datos.nombre = $("#nombre").val();
	// datos.ejercicio_descripcion = $('#ejercicio_descripcion').val();
	// datos.ejercicio_inicio =  $('#ejercicio_inicio').val().toLocaleString('es-ES','sort');
	// datos.ejercicio_fin = $('#ejercicio_fin').val().toLocaleString('es-ES','sort');
	datos.path = $("#path").val();

	fetch("/empresas/empresasalta", {
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
				toast.value = "Error de Inserccion! " + data.id;
			} else {
				// egrid.dataSource = new window.Smart.DataAdapter({
				// 	dataSource: "/empresas/listaempresasconfig/",
				// 	dataSourceType: "json",
				// 	type: "POST",
				// 	id: "id",
				// 	dataFields: Lfilas,
				// });
				egrid.update();
				toast.closeLast();
				toast.open();
				toast.type = "success";
				toast.value = "Inserccion correcta Empresa:! " + data;
			}
		})
		.catch((error) => {
			console.error("Error:", error);
		});
};
var isNumber = function isNumber(value) {
	return typeof value === "number" && isFinite(value);
};
