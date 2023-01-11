
const colors = ['#4424d4', '#6841df', '#8c5fe9', '#b07cf4', '#d49aff', '#2D660A', '#144D14', '#0A3C02', '#0C2808', '#020301','#28ffc7','#00a77b','#FFFFFF']
var resumentext= [];
var datosTope = 0;
var columnaResumen = [];

var cabecera = [];
var listalay = [];

window.onload = function() {
  
const resumen = document.getElementById('resumen');
const resumen1 = document.getElementById('resumen1');
const resumen2 = document.getElementById('resumen2');
const idlayout = document.getElementById('idlayout');
const distable = document.getElementById('distable');
const imprime = document.getElementById('imp');
const imprime1 = document.getElementById('imp1');
const imprime2 = document.getElementById('imp2');
const chart = document.getElementById('chart');
const chart1 = document.getElementById('chart1');
const chart2 = document.getElementById('chart2');
const resumenlayout = document.getElementById('resumenlayout');
const paretolayout = document.getElementById('paretolayout');
const buttons = document.querySelectorAll("smart-radio-button");

for (let i = 0; i < buttons.length; i++) {
  console.log( buttons[i] );
  buttons[i].addEventListener('change', function (event) {
      const checkStatus = event.detail.value;
      
  });
}
var nivel = "";
var codigo = "";
imprime2.addEventListener('click', function (event) {
  chart2.saveAsPDF(nivel+'_ChartPie.pdf','landscape');
});
imprime.addEventListener('click', function (event) {
  chart.saveAsPDF(nivel+'_ChartDist.pdf','landscape');
});
imprime1.addEventListener('click', function (event) {
  chart1.saveAsPDF(nivel+'_ChartBar.pdf','landscape');
});
resumenlayout.addEventListener('cellClick', function (event) {
  const detail = event.detail,
      id = detail.id,
      dataField = detail.dataField,
      row = detail.row,
      value = detail.value,
      originalEvent = detail.originalEvent;
      var ultimonivel = "";
      ultimonivel = row.nivel;
      nivel = row.descripcion;
      actualizar(nivel,ultimonivel);
      //chart.update();
      //distable.update();
});
};
$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();
    const toast = document.querySelectorAll('smart-toast')[0];

    function getChipColor(colorIndex) {
      const color = colors[colorIndex];
      return color;
    }
    var lista =[];
    var elemento = {};
    $.ajax({ 
      url:  '/objetivos/leerlayout/',
      type: 'GET',
      dataType: 'json',
      cache: false, 
      data:{id: 0},
      success: function(lays) {
        listalay = lays;
        for (var i=0; i < lays.length; i++) {
          elemento.label = lays[i].codigo+"- "+lays[i].nombre+'-'+lays[i].descripcion+'-'+lays[i].observaciones+'-'+lays[i].campo_resumen;
          elemento.value = lays[i].id;
          columnaResumen[lays[i].id] = lays[i].campo_resumen;
          lista.push(elemento);
          elemento = {};
        }
        idlayout.dataSource = lista;

        },
        error: function(jqXHR, textStatus, err) {
            alert('Error '+textStatus+', err '+err);
       },
    });
    window.Smart('#resumenlayout', class {
      get properties() {
          return {
            dataSource: new window.Smart.DataAdapter({
                  dataSource: [],
                  dataFields: [
                      'nivel: number',
                      'descripcion: string',
                      'count: number'
                  ]
              }),
              columnResize: true,
              columnResizeFeedback: true,
              freezeHeader: true,
              selection: true,
              columns:  [
                { label:   'Nivel', dataField: 'nivel',dataType: 'number', align: 'center',with: 30},
                { label:'Descripcion', dataField: 'descripcion', dataType: 'string'},
                { label: 'Registros', dataField: 'count', dataType: 'number',formatFunction(settings) {
                  settings.template = `<span class="badge badge-success">${settings.value}</span>`;
              } }
              ]
          };
      }
    });
    window.Smart('#distable', class {
      get properties() {
          return {
                  dataSource: new window.Smart.DataAdapter({
                  dataSource: [],
                  dataFields: [
                      'Intervalo: string',
                      'FreqAbs: number',
                      'FreqRel: number'
                  ]
              }),
              columnResize: true,
              columnResizeFeedback: true,
              freezeHeader: true,
              columns: cabecera
          };
      }
    });
    window.Smart('#paretolayout', class {
      get properties() {
          return {
                  dataSource: new window.Smart.DataAdapter({
                  dataSource: [],
                  dataFields: [
                      'literal: string',
                      'total: number',
                      'percent: number'
                  ]
              }),
              columnResize: true,
              columnResizeFeedback: true,
              freezeHeader: true,
              columns: cabecera
          };
      }
    });
  });
var datos = [];

Smart('#chart', class {
  get properties() {
    return {
        animation: "none",
        clip: false,
        caption: '',
        description: '',
        showLegend: true,
        borderLineWidth: 0,
        padding: { left: 0, top: 2, right: 0, bottom: 5 },
        titlePadding: { left: 40, top: 0, right: 0, bottom: 10 },
        colorScheme: 'scheme04',
        showToolTipsOnAllSeries: true,
        enableCrosshairs: true,
        dataSource:datos,
        xAxis: {
            dataField: 'Clave',
            valuesOnTicks: true,
            visible: false        
        },
        valueAxis: {
            title: { text: 'Objetivo' },
           // unitInterval: 10000,
            formatSettings: {
              decimalPlaces: 1
          },
        },
        seriesGroups: [
            {
                type: 'scatter',
                series: [
                    { dataField: 'Objetivo', symbolSize: 3, symbolType: 'circle', displayText: 'Objetivo'}]
                }
        ]
    };
}
});
Smart('#chart1', class {
  get properties() {
      return {
          caption: '',
          description: '',
          showToolTipsOnAllSeries: false,
          showLegend: true,
          borderLineWidth: 0,
          padding: { left: 5, top: 2, right: 5, bottom: 5 },
          titlePadding: { left: 40, top: 0, right: 0, bottom: 10 },
          dataSource: [],
          xAxis: {
              dataField: 'Mes',
              gridLines: {
                  visible: true
              }
          },
          colorScheme: 'scheme04',
          valueAxis: {
            visible: true,
            formatSettings: {
              decimalPlaces: 1
          },
            title: { text: 'Cambiarlo' },
            tickMarks: { color: '#6B1CB0' }
          },
          seriesGroups: [
              {
                  type: 'column',
                  columnsGapPercent: 50,
                  seriesGapPercent: 0,
                  showLabels: false,
                  valueAxis: 
                    { unitInterval: 0,
                      minValue: 0,
                      maxValue: 'auto',
                      description:  'Objetivo',
                      axisSize: 'auto'
                  },
                  series: [
                      { dataField: 'Valor', displayText: 'Objetivo',labels: { visible: false}, colorFunction: function (value, itemIndex, serie, group) {
                       return  itemIndex == 0 ? '#E74C3C': '#375D81';
                    }, }
                  ]
              }
          ]
      };
  }
  });
  Smart('#chart2', class {
    get properties() {
      return {
        caption: '',
        description: '',
        showToolTipsOnAllSeries: false,
        showLegend: true,
        borderLineWidth: 0,
        padding: { left: 5, top: 2, right: 5, bottom: 5 },
        titlePadding: { left: 40, top: 0, right: 0, bottom: 10 },
        dataSource: [],
        seriesGroups: [
          {
              type: 'pie',
              showLabels: true,
              series: [
                  {
                      dataField: 'Valor',
                      displayText: 'Mes',
                      labelRadius: 90,
                      initialAngle: 0,
                      radius: 75,
                      centerOffset: 5,
                      formatFunction: function (value) {
                          if (isNaN(value)) {
                              // Legend labels formatting
                              return value;
                          }
                          return parseFloat(value).toFixed(2) + '%';
                      },
                      useGradientColors: false
                  }
              ]
          }
      ]
    };
  }
});



  //----------- FIN click -----------------
  idlayout.addEventListener('change', async function (event) {

    fetch('http://localhost:3000/objetivos/leerniveleslayout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({layout_id: event.detail.value}),
    })
    .then(response => response.json())
    
    .then(data => {
      actualizar (data.esquema[1],data.nivel[0]);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
    $.ajax({ 
      url: '/objetivos/resumenlayout',
      type: 'GET',
      dataType: 'json',
      cache: false, 
      data: { empresa_id: '2', layout_id: idlayout.value[0].value},  
      success: function(datoslayout) {
        resumenlayout.dataSource = datoslayout;

        },
       error: function(jqXHR, textStatus, err) {
            alert('Error '+textStatus+', err '+err);
       },
   });
  });
  
 function actualizar(nivel,ultimonivel) {
    distable.hidden = true;
      $("#progressbar").css('width', '0' + "%");
       $.ajax({ 
        url: '/objetivos/demos',
        type: 'POST',
        dataType: 'json',
        cache: false, 
        data: { empresa_id: '2', layout_id: idlayout.value[0].value, nivel_id: ultimonivel},  
        success: function(data) {
          chart.dataSource = data;
          chart.caption ='Dispersion de Valores por:';
          chart.description = nivel;
          chart.update();
          chart.refresh();
          },
         error: function(jqXHR, textStatus, err) {
              alert('Error '+textStatus+', err '+err);
         },
      });
      $.ajax({ 
        url: '/objetivos/leerlayoutgrafico',
        type: 'GET',
        dataType: 'json',
        cache: false, 
        data: { empresa_id: '2', layout_id: idlayout.value[0].value},  
        success: function(datos) {
          $("#progressbar").css('width', '50' + "%");
          chart1.caption =  'Valores';
          chart1.description = 'en '+ columnaResumen[idlayout.value[0].value];
          chart1.dataSource = datos;
          chart1.update();
          chart1.refresh();
        //----------------------------------------------------------------
          },
         error: function(jqXHR, textStatus, err) {
              alert('Error '+textStatus+', err '+err);
         },
      });
      $.ajax({ 
        url: '/objetivos/leerlayoutgraficopie',
        type: 'GET',
        dataType: 'json',
        cache: false, 
        data: { empresa_id: '2', layout_id: idlayout.value[0].value},  
        success: function(datospie) {
          chart2.caption =  'Valores';
          chart2.description = 'en % '+ columnaResumen[idlayout.value[0].value];
          chart2.dataSource = datospie;
          chart2.update();
          chart2.refresh();
          },
         error: function(jqXHR, textStatus, err) {
              alert('Error '+textStatus+', err '+err);
         },
      });
      $.ajax({ 
        url: '/objetivos/distribucion',
        type: 'GET',
        dataType: 'json',
        cache: false, 
        data: { empresa_id: '2', layout_id: idlayout.value[0].value,nivel_id: ultimonivel},  
        success: function(datosdist) {
          
          cabecera = [
            { label:   columnaResumen[idlayout.value[0].value], dataField: 'Intervalo', dataType: 'string',with: 60},
            { label:'# '+nivel, dataField: 'FreqAbs', dataType: 'number',align: 'right'},
            { label: 'Peso', dataField: 'FreqRel', dataType: 'number',formatFunction(settings) {
              settings.template = `<span class="badge badge-info">${settings.value} %</span>`;
          } }
          ];
          distable.hidden = false;
          distable.dataSource = datosdist;
          distable.columns = cabecera;
          distable.refresh();
           
          },
        error: function(jqXHR, textStatus, err) {
              alert('Error '+textStatus+', err '+err);
        },
      });
      $.ajax({ 
        url: '/objetivos/pareto',
        type: 'GET',
        dataType: 'json',
        cache: false, 
        data: { empresa_id: '2', layout_id: idlayout.value[0].value,nivel_id: ultimonivel},  
        success: function(datospareto) {
          $("#progressbar").css('width', '100' + "%");

          var cabecerapareto = [
            { label: nivel, dataField: 'literal', dataType: 'string',width: 120,formatFunction(settings) {
              if (settings.value == 'Resto' || settings.value == 'Ochenta %') {
                settings.template = `<h5><strong>${settings.value}</strong></h5>`
              } 
          }},
            { label:columnaResumen[idlayout.value[0].value], dataField: 'total', dataType: 'number',align: 'right',formatFunction(settings) {
                //settings.template = settings.value.toFixed(2);
                settings.value = Intl.NumberFormat('es-512').format(settings.value.toFixed(2));
          }},
            { label: 'Peso', dataField: 'percent', dataType: 'number',formatFunction(settings) {
                settings.template = `<span class="badge badge-warning">${settings.value.toFixed(2)}%</span>`;
          } }
          ];
          paretolayout.dataSource = datospareto;
          paretolayout.columns = cabecerapareto;
          paretolayout.refresh();
          },
        error: function(jqXHR, textStatus, err) {
              alert('Error '+textStatus+', err '+err);
        },
      });
  };
