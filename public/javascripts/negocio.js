//Funciones JQuery + AJAX para HTML a Utilizar en la aplicacion para baculo
$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});
$(function() { 
   $("#provinciaid").change(function () { 
      $("#poblacionid").empty();
      $("#codigopostalid").empty();
   $.ajax({ 
      url: '/empresas/CargaPoblacion',
      type: 'POST',
      dataType: 'json',
      cache: false, 
      data: { provinciaid: $("#provinciaid").val()},  
      success: function(lpoblaciones) {
         if (lpoblaciones.rowCount > 1 ) {
            $("#poblacionid").append('<option value="">' +
            'Elige una Poblacion'+ '</option>');
         }
        $.each(lpoblaciones.rows, function (i, reg) {
            $("#poblacionid").append('<option value="'+ reg.poblacion + '">' +
            reg.poblacion + '</option>');
      });
   }, error: function(jqXHR, textStatus, err){
            alert('Error '+textStatus+', err '+err);
   }
});
});
});
$(function() { 
   $("#poblacionid").change(function () { 
         $("#codigopostalid").empty();
      $.ajax({ 
         url: '/empresas/CargaCodigoPostal',
         type: 'POST',
         dataType: 'json',
         cache: false, 
         data: { poblacionid: $("#poblacionid").val(),provinciaid: $("#provinciaid").val() },
         success: function (lcodigos) {
            
            if (lcodigos.rowCount > 1) {
              $("#codigopostalid").append(
                '<option value="">' +
                  "Mas de un Codigo Postal Elige Uno" +
                  "</option>"
              );
            }
           $.each(lcodigos.rows, function (i, reg) {
             $("#codigopostalid").append(
               '<option value="' +
                 reg.codigopostal +
                 '">' +
                 reg.codigopostal +
                 " </option>"
             );
           });
    }, error: function(jqXHR, textStatus, err){
               alert('Error '+textStatus+', err '+err);
      }
   });
});
});
$(function () {
  $("#empresaid").change(function () {
    $("#dependede").empty();
    $.ajax({
      url: "/contactos/CargaContactos",
      type: "POST",
      dataType: "json",
      cache: false,
      data: { empresaid: $("#empresaid").val() },
       success: function (lcontactos) {
          console.log(lcontactos);
         if (lcontactos.rowCount > 1) {
           $("#dependede").append(
             '<option value="">' + lcontactos.rowCount + " contactos" + "</option>"
           );
         } else if (lcontactos.rowCount == 0) {
          $("#dependede").append(
            '<option value="">' + "Sin contactos ..." + "</option>"
          );
         }
        $.each(lcontactos.rows, function (i, reg) {
          $("#dependede").append(
            '<option value="' +
              reg.idcontacto +
              '">' +
              reg.nombre + " "+
              reg.apellido1 +
              " " +
              reg.apellido2 +
              "</option>"
          );
        });
      },
      error: function (jqXHR, textStatus, err) {
        alert("Error " + textStatus + ", err " + err);
      },
    });
  });
});
$(function () {
  $("#idarea").change(function () {
    $("#idproceso").empty();
    $.ajax({
      url: "/proyectos/CargaProcesos",
      type: "POST",
      dataType: "json",
      cache: false,
      data: {
        idproyecto: $("#idproyecto").val(),
        idarea: $("#idarea").val(),
      },
      success: function (lprocesos) {
        console.log(lprocesos);
        if (lprocesos.rowCount > 1) {
          $("#idproceso").append(
            '<option value="">' + lprocesos.rowCount + " Procesos" + "</option>"
          );
        } else if ((lprocesos.rowCount = 0)) {
          $("#idproceso").append(
            '<option value="">' + "Sin procesos ..." + "</option>"
          );
        }
        $.each(lprocesos.rows, function (i, reg) {
          $("#idproceso").append(
            '<option value="' +
              reg.idproceso +
              '">' +
              reg.descripcion +
              "</option>"
          );
        });
      },
      error: function (jqXHR, textStatus, err) {
        alert("Error " + textStatus + ", err " + err);
      },
    });
  });
});