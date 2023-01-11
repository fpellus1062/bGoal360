
const Ftable = document.querySelector("#Ftable");
const colors = ['#FA5B0F', '#B4E051', '#8CD211', '#5AA700', '#4C8400', '#2D660A', '#144D14', '#0A3C02', '#0C2808', '#020301','#28ffc7','#00a77b','#FFFFFF']
const cabshadow = document.getElementById('cabecerasadhow');
const valoresshadow = document.getElementById('valoressadhow');
const toast = document.querySelectorAll('smart-toast')[0];
const cab = document.getElementById('idcabecera');
const jerarquia = document.getElementById('idfila');
var errores = "";
const tipos = document.getElementById("idtipos");
const tipo  = document.getElementById("idtipo");
const estrategico = document.getElementById("idestrategico");
const estrategia  = document.getElementById("idestrategia");
const resumen = document.getElementById("idresumen");
const lista = [];
var elemento = {};
var valores = [];
var valor = {};
var mFilas = [];
var newTipos = []
var columna = {
  label:"",
  dataField:"",
  dataType:""
}
var columnas = [];
const Lfilas =  [
  'Cliente: string',
  'producto: string',
  'Cajas: string'
];

window.onload = function () {
      var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
      $('#spinguardar').hide();
      for (var i = 0; i < cabshadow.options.length; i++) {
        elemento.value = (i);
        elemento.label = (i + 1).toString().padStart(2, '0') + '. ' + cabshadow.options[i].value;
        cab.insert(i,elemento);
        lista.push(elemento);
        valor[cabshadow.options[i].value] = valoresshadow.options[i].value;
        columna.label = cabshadow.options[i].value;
        columna.dataField = cabshadow.options[i].value;
        columna.dataType = 'string';
        columnas.push(columna);
        elemento = {};
        columna = {};
        }
        // Datos de las filas de muestra
        valores.push(valor);
        cab.sorted = true;
        
      $('#idlimpiar').on('click', function (event) {
        jerarquia.clearItems();
        cab.clearItems();
        mFilas = [];
        $('#idtipo').val("");
        cargarcampos();
      });
      //Seleccionamos una columna
      cab.addEventListener('itemClick', function (event) {
        const detail = event.detail,
            disabled = detail.disabled,
            index = detail.index,
            label = detail.label,
            selected = detail.selected,
            value = detail.value;
         
       });
       cab.addEventListener('dragEnd', function (event) {
        const detail = event.detail,
            container = detail.container,
            data = detail.data,
            item = detail.item,
            originalEvent = detail.originalEvent,
            previousContainer = detail.previousContainer,
            target = detail.target;
             // Configuramos tipo de dato y array de tipos
             if (jerarquia.items.length < 4) {
              cab.allowDrag = true;
             }
             tipos.selectedIndex = item.value;
             tipo.value =  $('#idtipos').val().selected;
             $('#idtipo').val($('#idtipos').val());
             // Configuramos estrategica y array de estrategia
             estrategico.selectedIndex = item.value;
             estrategia.value =  $('#idestrategico').val().selected;
             $('#idestrategia').val($('#idestrategico').val());
             cab.select(item);
             
             $("#idresumen").append('<option value="' + cab.value[0].value + '" >' +  cab.value[0].label + ' </option>');
             if (jerarquia.selectedIndexes.length == 0) {
              jerarquia.clearSelection();
              $('#idtipo').val("");
             }
      });
      jerarquia.addEventListener('itemClick', function (event) {
        const detail = event.detail,
            disabled = detail.disabled,
            index = detail.index,
            label = detail.label,
            selected = detail.selected,
            value = detail.value;
            // Configuramos tipo de dato y array de tipos
            tipos.selectedIndex = value;
            tipo.value =  $('#idtipos').val().selected;
            $('#idtipo').val($('#idtipos').val());
            // Configuramos estrategica y array de estrategia
            estrategico.selectedIndex = value;
            estrategia.value =  $('#idestrategico').val().selected;
            $('#idestrategia').val($('#idestrategico').val());
       });
       jerarquia.addEventListener('dragEnd', function (event) {
        const detail = event.detail,
            container = detail.container,
            data = detail.data,
            item = detail.item,
            originalEvent = detail.originalEvent,
            previousContainer = detail.previousContainer,
            target = detail.target;

             // Configuramos tipo de dato y array de tipos
             if (jerarquia.items.length > 3) {
              cab.allowDrag = false;
              toast.open();
              toast.type = 'warning';
              toast.value = 'Has alcanzado el Limite de  4 Campos de Jerarquia como máximo';
             }
             tipos.selectedIndex = item.value;
             tipo.value =  $('#idtipos').val().selected;
             $('#idtipo').val($('#idtipos').val());
             // Configuramos estrategica y array de estrategia
             estrategico.selectedIndex = item.value;
             estrategia.value =  $('#idestrategico').val().selected;
             $('#idestrategia').val($('#idestrategico').val());
             jerarquia.select(item);
             mFilas[item.dataIndex] = item.dataIndex;
             cab.clearSelection();
             $('#idtipo').val('Texto');
             tipos[tipos.selectedIndex].value = $('#idtipo').val();
             console.log('Borro ',jerarquia.value[0].value)
             $("#idresumen option[value='" +jerarquia.value[0].value+ "']").remove();
      });
      cab.addEventListener('dragStart', function (event) {
        const detail = event.detail,
            container = detail.container,
            data = detail.data,
            item = detail.item,
            originalEvent = detail.originalEvent,
            previousContainer = detail.previousContainer,
            target = detail.target;
      });
      $('#idestrategia').on('change', function (event) {
        
        // Cambiamos Estrategia
        if (jerarquia.selectedIndexes.length != 0) {
          console.log(estrategico.selectedIndex);
          estrategico[estrategico.selectedIndex].value = $('#idestrategia').val();
      } else {
          toast.open();
          toast.type = 'error';
          toast.value = 'Debe marcar un Campo de Jerarquia';
          $('#idestrategia').val("E");
      }
      });

      $('#idtipo').on('change', function (event) {
        const tipo = event.currentTarget;
        
        // Cambiamos Tipo de Dato 
       
        if (jerarquia.selectedIndexes.length != 0) {
            tipos[tipos.selectedIndex].value = $('#idtipo').val();
        if (tipos[tipos.selectedIndex].value == 'Texto') {
          $("#idresumen option[value='" +jerarquia.value[0].value+ "']").remove();
        } else {
          $("#idresumen").append('<option value="' + jerarquia.value[0].value + '" >' +  jerarquia.value[0].label + ' </option>');
        }
        } else {
          toast.open();
          toast.type = 'error';
          toast.value = 'Debe marcar un Campo de Jerarquia';
          $('#idtipo').val("");
        }
      });
      Ftable.messages = {
        'en': {  
          "find": "Buscar ....",
          "findInView": "Buscar ....",
          'columnMenuItemSortAsc': 'Ordenar {{mode}}',
          'columnMenuItemSortDesc': 'Ordenar {{mode}}',
          'columnMenuItemRemoveSort': 'Quitar Ordenacion',
          'expandRow':'Abrir Fila',
          'collapseRow':'Cerrar Fila',
          'found': 'Resultados',
          'invalidCellValue': 'La Celda \"{{label}}\",:no puede estar vacía.'
          }
      };
      Ftable.locale = 'en';
      
      window.Smart('#Ftable', class {
          get properties() {
              return {
                      dataSource: new window.Smart.DataAdapter({
                          dataSource: valores,
                          dataFields: valores
                  }),
                  columnResize: true,
                  columnResizeFeedback: true,
                  freezeHeader: true,
                  columns: columnas
              };
          }
        });
  
      // $('#idcoordenadas').find("option[id="+this.id+"]").remove();
      $('#idguardar').on('click', function (event) {
        errores = false;
        if (!$('#fichero').val()) {
          toast.open();
          toast.type = 'error';
          toast.value = 'El Nombre del Fichero no puede estar vacio';
          errores = true;
        };
        if (mFilas.length == 0) {
          toast.open();
          toast.type = 'error';
          toast.value = 'No hay Jerarquia Seleccionadas';
          errores = true;
        }
        if (resumen.value == "#NA") {
          toast.open();
          toast.type = 'error';
          toast.value = 'Debe elegir un campo resumen';
          errores = true;
        }
        if (errores) {
          return false;
        }

        for (var i = 0; i < cabshadow.options.length; i++) {
          cabshadow.options[i].selected = true;
          tipos.options[i].selected = true;
          estrategico.options[i].selected = true;
        }
        jerarquia.selectedIndexes = mFilas;
        var guardafileModal = new bootstrap.Modal(document.getElementById('guardafileModal'), {
          keyboard: false
        });
        guardafileModal.show();
        const Lgrid = document.querySelector("#Lgrid");
       
        const Lfilas =  [
        'id: number',
        'codigo: string',
        'descripcion: string',
        'fecha: string',
        'observaciones: string'
        ];
      
        const Lcabecera = [
          { label:  'id',  dataField: 'id', align: 'right', dataType: 'number', visible: false, cellsFormat: 'n'},
          {
              label: 'Codigo', dataField: 'codigo', dataType: 'string',allowEdit: false
          },
          {
            label: 'Nombre', dataField: 'descripcion', dataType: 'string',allowEdit: false
          },
          {
          label: 'Fecha', dataField: 'fecha', dataType: 'string',allowEdit: false
        },
        { label:  'Observaciones',  dataField: 'observaciones', align: 'left', dataType: 'string', visible: false},
        ];
          $.ajax({ 
            url: '/objetivos/leerlayout',
            type: 'GET',
            dataType: 'json',
            cache: false, 
            data: { empresa_id: '2'},  
            success: function(datos) {
              window.Smart('#Lgrid', class {
                get properties() {
                  return {
                    scrolling: 'deferred',
                    sorting: {
                      enabled: true
                    },
                    appearance: {
                      allowRowDetailToggleAnimation: true,
                      autoShowColumnFilterButton: false,
                  },
                    selection: {
                      enabled: true,
                      mode: 'extended',
                      allowCellSelection: false
                    },
                    behavior: { columnResizeMode: 'growAndShrink' },
                    layout: {
                     rowHeight: 'auto',
                     allowCellsWrap: true,
                      },
                    appearance: {
                        allowRowDetailToggleAnimation: true,
                        autoShowColumnFilterButton: false,
                    },
                    rowDetail: {
                      enabled: true,
                      visible: true,
                      height: 100,
                      template: 
                          `<div class="container">
                                  <strong>Observaciones:</strong>
                                  </br>
                                  <p>{{observaciones}}</p>
                          </div>`
                          },
                        columns: Lcabecera,
                        dataSource: new window.Smart.DataAdapter({
                            dataSource:  datos,
                            dataSourceType: 'json',
                            id: 'id',
                            dataFields: Lfilas
                      })
                    };
                }
                });
              },
             error: function(jqXHR, textStatus, err) {
                  alert('Error '+textStatus+', err '+err)
             },
          });
        
      });
      function cargarcampos() {
        const cab = document.getElementById('idcabecera');
        elemento = {};
        for (var i = 0; i < cabshadow.options.length; i++) {
          elemento.value = (i);
          elemento.label = (i + 1).toString().padStart(2, '0') + '. ' + cabshadow.options[i].value;
          cab.insert(i,elemento);
          lista.push(elemento);
          elemento = {};
          }
        }
    }; 
    $("#registrar").on("click", function () {
      if ($('#flayout').val() != '' && $('#namelayout').val() != '' && $('#comentarios').val() != '') {
        const lay  = document.getElementById("flayout");
      
        for (var i = 0; i < Lgrid.rows.length; i++) {
          console.log(Lgrid.rows[i].data.codigo);
          if (lay.value == Lgrid.rows[i].data.codigo)
          {
            toast.open();
            toast.type = 'error';
            toast.value = 'Codigo de Layout ya existente!';
            errores = true;
            return false;
          }
        }
        $('#spinguardar').show();
        savedata.submit();
      }
    });
    
    // var modalId = document.getElementById('guardafileModal');

    // modalId.addEventListener('show.bs.modal', function (event) {
   
    //   const Lgrid = document.querySelector("#Lgrid");
    //   const toast = document.querySelectorAll('smart-toast')[0];
    //   $("#registrar").on("click", function () {
    //     alert($('#flayout').val() );
    //     if ($('#flayout').val() != '' && $('#namelayout').val() != '' && $('#comentarios').val() != '') {
    //       const lay  = document.getElementById("flayout");
        
    //       for (var i = 0; i < Lgrid.rows.length; i++) {
    //         console.log(Lgrid.rows[i].data.codigo);
    //         if (lay.value == Lgrid.rows[i].data.codigo)
    //         {
    //           toast.open();
    //           toast.type = 'error';
    //           toast.value = 'Codigo de Layout ya existente!';
    //           errores = true;
    //           return false;
    //         }
    //       }
    //       toast.open();
    //       toast.type = 'warning';
    //       toast.value = 'Preparando Layout de Trabajo!';
    //       errores = true;
    //       //configfile.submit();
    //       $('#spinguardar').show();
    //       savedata.submit();
    //     }
    //   });
      
    //   const Lfilas =  [
    //   'id: number',
    //   'codigo: string',
    //   'descripcion: string',
    //   'fecha: string',
    //   'observaciones: string'
    //   ];
    
    //   const Lcabecera = [
    //     { label:  'id',  dataField: 'id', align: 'right', dataType: 'number', visible: false, cellsFormat: 'n'},
    //     {
    //         label: 'Codigo', dataField: 'codigo', dataType: 'string',allowEdit: false
    //     },
    //     {
    //       label: 'Nombre', dataField: 'descripcion', dataType: 'string',allowEdit: false
    //     },
    //     {
    //     label: 'Fecha', dataField: 'fecha', dataType: 'string',allowEdit: false
    //   },
    //   { label:  'Observaciones',  dataField: 'observaciones', align: 'left', dataType: 'string', visible: false},
    //   ];
    //   $('a[data-toggle=modal], button[data-toggle=modal]').click(function () {
    //     $.ajax({ 
    //       url: '/objetivos/leerlayout',
    //       type: 'GET',
    //       dataType: 'json',
    //       cache: false, 
    //       data: { empresa_id: '2'},  
    //       success: function(datos) {
    //         window.Smart('#Lgrid', class {
    //           get properties() {
    //             return {
    //               scrolling: 'deferred',
    //               sorting: {
    //                 enabled: true
    //               },
    //               appearance: {
    //                 allowRowDetailToggleAnimation: true,
    //                 autoShowColumnFilterButton: false,
    //             },
    //               selection: {
    //                 enabled: true,
    //                 mode: 'extended',
    //                 allowCellSelection: false
    //               },
    //               behavior: { columnResizeMode: 'growAndShrink' },
    //               layout: {
    //                rowHeight: 'auto',
    //                allowCellsWrap: true,
    //                 },
    //               appearance: {
    //                   allowRowDetailToggleAnimation: true,
    //                   autoShowColumnFilterButton: false,
    //               },
    //               rowDetail: {
    //                 enabled: true,
    //                 visible: true,
    //                 height: 100,
    //                 template: 
    //                     `<div class="container">
    //                             <strong>Observaciones:</strong>
    //                             </br>
    //                             <p>{{observaciones}}</p>
    //                     </div>`
    //                     },
    //                   columns: Lcabecera,
    //                   dataSource: new window.Smart.DataAdapter({
    //                       dataSource:  datos,
    //                       dataSourceType: 'json',
    //                       id: 'id',
    //                       dataFields: Lfilas
    //                 })
    //               };
    //           }
    //           });
    //         },
    //        error: function(jqXHR, textStatus, err) {
    //             alert('Error '+textStatus+', err '+err)
    //        },
    //     });
    //   });
    //});

