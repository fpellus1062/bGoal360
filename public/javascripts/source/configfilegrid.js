
const fgrid = document.querySelector("#Fgrid");
const jerarquia = document.getElementById("jerarquia");
const colors = ['#FA5B0F', '#B4E051', '#8CD211', '#5AA700', '#4C8400', '#2D660A', '#144D14', '#0A3C02', '#0C2808', '#020301','#28ffc7','#00a77b','#FFFFFF']
const toast = document.querySelectorAll('smart-toast')[0];

const Lfilas =  [
  'id: number',
  'nombre_campo: string',
  'valor: string',
  'tipo_dato: string',
  'tipo_columna: string',
  'estrategico: string',
  'nivel: string',
  'accion: string'
];

$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();
    console.log(jerarquia);
    function getChipColor(colorIndex) {
      const color = colors[colorIndex];
      return color;
    }

    const Lcabecera = [
      { label:  'Id Campo',  dataField: 'id', cellsAlign: 'right', dataType: 'number', allowEdit: false,width: 80,description:'Número de Orden'},
      {
        label: 'Nombre', dataField: 'nombre_campo', dataType: 'string',cellsClassName: 'cell-class-1', allowEdit: false,width: 300
      },
      // {
      //   label: 'Valor', dataField: 'valor', dataType: 'string', allowEdit: false,width: 600
      // },
      {
        label: 'Tipo Dato', dataField: 'tipo_dato', align: 'center',dataType: 'string', validationRules: [{ type: 'required' }],editor: {
          template: 'dropDownList',
  
          readonly: true,
          dropDownButtonPosition: 'right',
          autoOpen: true,
          pills: true,
          singleSelect: true,
          dataSource: [
            { value: 'Texto', color: '#8E24AA', label: 'Texto'},
            { value: 'Número', color: '#41B883', label: 'Número' },
            { value: 'Fecha', color: '#41B883', label: 'Fecha' },
          ]
          // onInit(index, dataField, editor) {
          //   editor.messages.es = { now: 'Hoy', dateTabLabel: 'Fecha', timeTabLabel: 'Hora' };
          //   editor.locale = 'es';
          //   editor.firstDayOfWeek = 1;
          //   editor.placeholder = "Inicio Ejercicio ...";
          //   editor.nullable = true;
          // }
      }
      },
     
      {
        label: 'Estrategico', dataField: 'estrategico',align: 'center',cellsAlign: 'center', validationRules: [{ type: 'required' }],editor: {
          template: 'dropDownList',
          readonly: true,
          dropDownButtonPosition: 'right',
          autoOpen: true,
          pills: true,
          singleSelect: true,
          dataSource: [
            { value: 'Estrategico', color: '#8E24AA', label: 'Estrategico'},
            { value: 'Operativo', color: '#41B883', label: 'Operativo' },
          ]
      }
      },
      {
        label: 'Tipo Columna', dataField: 'tipo_columna',align: 'center',cellsAlign: 'center', validationRules: [{ type: 'required' }],editor: {
          template: 'dropDownList',
          readonly: true,
          dropDownButtonPosition: 'right',
          autoOpen: true,
          pills: true,
          singleSelect: true,
          dataSource: [
            { value: '--', color: '#41B883', label: 'Sin Asignar'},
            { value: 'F', color: '#8E24AA', label: 'Fila'},
            { value: 'R', color: '#41B883', label: 'Resúmen' },
            { value: 'C', color: '#8E24AA', label: 'Columna' },
          ]
          // onInit(index, dataField, editor) {
          //   editor.messages.es = { now: 'Hoy', dateTabLabel: 'Fecha', timeTabLabel: 'Hora' };
          //   editor.locale = 'es';
          //   editor.firstDayOfWeek = 1;
          //   editor.placeholder = "Inicio Ejercicio ...";
          //   editor.nullable = true;
          // }
      }
      },
      {
        label: 'Nivel Jerarquia', dataField: 'nivel',align: 'center',cellsAlign: 'center', validationRules: [{ type: 'required' }],editor: {
          template: 'dropDownList',
          readonly: true,
          dropDownButtonPosition: 'right',
          autoOpen: true,
          pills: true,
          singleSelect: true,
          dataSource: [
            { value: '--', color: '#8E24AA', label: 'Sin Asignar'},
            { value: '1', color: '#8E24AA', label: 'Primero'},
            { value: '2', color: '#41B883', label: 'Segundo' },
            { value: '3', color: '#41B883', label: 'Tercero' },
            { value: '4', color: '#41B883', label: 'Cuarto' },
          ]
          // onInit(index, dataField, editor) {
          //   editor.messages.es = { now: 'Hoy', dateTabLabel: 'Fecha', timeTabLabel: 'Hora' };
          //   editor.locale = 'es';
          //   editor.firstDayOfWeek = 1;
          //   editor.placeholder = "Inicio Ejercicio ...";
          //   editor.nullable = true;
          // }
      }
      },
      {label:  'Accion',  dataField: 'accion', align: 'center', cellsAlign: 'center', width: 150,allowEdit: false,
        template: function (formatObject) {
          if (!formatObject.template) {
            const data = document.createElement('span');
            const baja = document.createElement('div');
            baja.style.background = getChipColor(13);
            baja.classList.add("btn-group");
            baja.innerHTML ='<a class="btn btn-default" href="#"><i class="fas fa-exchange-alt fa_custom" title="Dar de Alta / Baja la Empresa"></i></a>';
            data.innerHTML = formatObject.value;
            data.style.marginLeft = '7px';
            baja.row = formatObject.row;
            const template = document.createElement('div');
            template.appendChild(data);
            template.appendChild(baja);
            formatObject.template = template;
              baja.addEventListener('click', () => {
                    const row = baja.row;
                    const datebaja = row.data.datebaja;
                   
                    fgrid.beginUpdate();
                 
                      if (dardebaja(row.data.id,datebaja)) {
                        if (datebaja !=  null) {
                          fgrid.setCellValue(row.data.id,'datebaja',null);
                        } else {
                          fgrid.setCellValue(row.data.id,'datebaja',new Date());
                        }
                        //fgrid.setCellValue(row.data.id,'datebaja',( (datebaja != '' && datebaja != null) ? '': new Date()));
                        toast.open();
                        toast.type = 'success';
                        toast.value = 'Operacion realizada con exito!';
                      } else {
                        toast.open();
                        toast.type = 'error';
                        toast.value = 'Error de Baja!';
                        fgrid.setCellValue(row.data.id,'datebaja',datebaja);
                      };
                    //}
                    fgrid.endUpdate();
            });
      }
      
  },
}
];
fgrid.messages = {
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
fgrid.locale = 'en';
window.Smart('#Fgrid', class {
      get properties() {
      return {
          editing: {
            batch: false,
            enabled: true,
            action: 'doubleClick',
            mode: 'row'
          },
          scrolling: 'deferred',
          sorting: {
            enabled: true
          },
          header: {
            visible: true,
            buttons: ['search']
            },
          footer: {visible: true},
          selection: {
              enabled: true,
              mode: 'one'
          },
              behavior: { columnResizeMode: 'growAndShrink' },
              layout: {
              rowHeight: 'auto',
              rowMinHeight: 30,
              allowCellsWrap: true,
                },
              appearance: {
                  allowRowDetailToggleAnimation: true,
                  autoShowColumnFilterButton: true,
                  alternationCount: 2
              },
            columns: Lcabecera,
            dataSource: new window.Smart.DataAdapter({
                dataSource:   '/objetivos/getfileCSV',
                dataSourceType: 'json',
                type: 'POST',
                id: 'id',
                dataFields: Lfilas
          }),
          rowDetail: {
            enabled: true,
            visible: true,
            height: 140,
            template: 
                `<div class="card">
                  <div id = "cabecera" class="card-header"><h5>{{Contenido}}</h5></div>
                  <div class="card-body">{{valor}}</div>
                  <div class="card-footer">Footer</div>
                </div>`
              },

          onCellUpdate: function(cell, oldValue, newValue, confirm) {
            var fila = cell[0].row;
            var columna =  cell[0].column.dataField;
            confirm(true)
            if (oldValue === newValue) {
              confirm(false);
            }
            //Convertimos a Locale UTC
            if (cell[0].column.label.slice(0, 5) == 'Fecha') {
              newValue =  newValue.toLocaleString('es-ES','sort');
            }
            //   $.ajax({ 
            //       url: '/empresas/updateempresaconfig',
            //       type: 'PUT',
            //       dataType: 'json',
            //       cache: false, 
            //       data: { empresa_id: fila.data.id,col: columna,newvalor:  newValue},  
            //       success: function(datos) {
            //         if (datos == 1) {
            //           toast.open();
            //           toast.type = 'success';
            //           toast.value = 'Operacion realizada con exito!';
            //           confirm(true);
            //           fgrid.beginUpdate();
            //           fgrid.refresh();

            //         fgrid.endUpdate();
            //         } else {
            //           toast.open();
            //           toast.type = 'error';
            //           toast.value = 'Error de Actualizacion! en el campo: '+columna;
            //           confirm(false);
            //         }
            //         },
            //       error: function(jqXHR, textStatus, err) {
            //             alert('Error '+textStatus+', err '+err);
            //   },
            // });

          }
        };}

        });
});
fgrid.addEventListener('rowClick', function (event) {
const detail = event.detail,
      row = detail.row,
      originalEvent = detail.originalEvent,
      id = detail.id,
      isRightClick = detail.isRightClick,
      pageX = detail.pageX,
      pageY = detail.pageY;
  });

  function dardebaja(id,datebaja) {
    $.ajax({ 
      url: '/empresas/deleteempresaconfig',
      type: 'PUT',
      dataType: 'json',
      cache: false, 
      data: { empresa_id: id,newvalor: datebaja},  
      success: function(datos) {
          fgrid.beginUpdate();
          fgrid.dataSource = new window.Smart.DataAdapter({
            dataSource:   '/empresas/listaempresasconfig/',
            dataSourceType: 'json',
            type: 'POST',
            id: 'id',
            dataFields: Lfilas
        });
        fgrid.endUpdate();
        },
        error: function(jqXHR, textStatus, err) {
            alert('Error '+textStatus+', err '+err);
            return false;
     },
    });
    return true;
  }
  // newBtn.addEventListener  ('click', function(event)  {
  //   if (dardealta()) {
  //     fgrid.refresh();
  //   }
    
  // });
  configfile.onsubmit = async (e) => {
    e.preventDefault();

    var datos = {};
    datos.empresa_id = $('#empresa_id').val();
    datos.nombre = $('#nombre').val();
    datos.ejercicio_descripcion = $('#ejercicio_descripcion').val();
    datos.ejercicio_inicio =  $('#ejercicio_inicio').val().toLocaleString('es-ES','sort');
    datos.ejercicio_fin = $('#ejercicio_fin').val().toLocaleString('es-ES','sort');
    datos.path = $('#path').val();

    fetch('/empresas/empresasalta', {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datos),
    })
    .then(response => response.json())
    
    .then(data => {
      console.log('Success:', data);
      fgrid.dataSource = new window.Smart.DataAdapter({
           dataSource:   '/empresas/listaempresasconfig/',
           dataSourceType: 'json',
           type: 'POST',
           id: 'id',
           dataFields: Lfilas
       });
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  };
