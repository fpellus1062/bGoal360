// JavaScript Header
history.pushState(null, null, document.URL);
window.addEventListener('popstate', function () {
    history.pushState(null, null, document.URL);
});
const toast = document.querySelectorAll("smart-toast")[0];
var offcanvasUser = document.getElementById('offcanvasUser');
var bsOffcanvas = new bootstrap.Offcanvas(offcanvasUser)
var emp_defecto = '';
var alertWindow = document.querySelector('smart-alert-window');
if (!localStorage.getItem('Change_empresa')) {
    var emp_defecto = 'selected';
};
//Leemos datos de Usuario Session
$.ajax({ 
  url: '/usuarios/usuariosession',
  type: 'POST',
  dataType: 'json',
  cache: false, 
  data: { dummy: ""},  
  success: function(data) {
    $('#usuarionombre').val(data[0].nombre);
    $('#usuarioapellido1').val(data[0].apellido1);
    $('#usuarioapellido2').val(data[0].apellido2);
    $('#usuarioemail').val(data[0].email);
}, error: function(jqXHR, textStatus, err){
        alert('Error '+textStatus+', err '+err);
}
});
//Guardamos cambios de Usuario Session
usuarioconfig.onsubmit = async (e) => {
  e.preventDefault();
  var datos = {};
  datos.nombre = $("#usuarionombre").val();
  datos.apellido1 = $("#usuarioapellido1").val();
  datos.apellido2 = $("#usuarioapellido2").val();
  datos.password = $("#usuariopassword").val();

  fetch("/usuarios/updateusuariosconfig", {
    method: "put",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  })
    .then((response) => response.json())

    .then((data) => {
      console.log("Success:", data);
      bsOffcanvas.hide();
      if (data != 'Ok') {
        toast.open();
        toast.type = "error";
        toast.value = "Error de Actualizacion Uusuarios! ";
      } else {
        toast.open();
        toast.type = "success";
        toast.value = "Usuario Actualizado!";
      }

    })
    .catch((error) => {
      console.error("Error:", error);
    });
    const usuarios = /usuarioslistado/g;
    if (location.pathname.match(usuarios)) {
     $(location).attr('href',location.pathname);
    }
};
$.ajax({ 
  url: '/empresas/usuariosempresas',
  type: 'POST',
  dataType: 'json',
  cache: false, 
  data: { dummy: ""},  
  success: function(data) {
    $.each(data.rows, function (i, reg) {
  
      if ( reg.id == data.empresa_defecto ) 
      {
          $("#idempresa").append('<option value="'+ reg.id + '" selected >' +
          reg.empresa_id+' - '+reg.nombre + '</option>'); 
      } else {
          $("#idempresa").append('<option value="'+ reg.id + '">' +
          reg.empresa_id+' - '+reg.nombre + '</option>');
      }
        
  });
}, error: function(jqXHR, textStatus, err){
        alert('Error '+textStatus+', err '+err);
}
});

 $('#idempresa').on('change', async function (event) {
   // Cambiamos Empresa
   var empresanew  = $('#idempresa').val();
   var commits = "";
    var response = await fetch('/objetivos/cambioempresa/'+empresanew);
    if (response.ok) { 
       commits = await response.json();
       console.log(commits);
       alertWindow.open();
     } else {
       alert("HTTP-Error: " + response.status);
     }


  //   function cancelHandler(event) {
  //     const target = event.target;
  //     modal.close();
  // }

  alertWindow.addEventListener('click', function (event) {
      const target = event.target;
      if (target.closest('.smart-confirm-button')) {
          alertWindow.close();
          //$(location).attr('href','/objetivos/listalayouts');
          $(location).attr('href',document.URL);
          //$(location).reload();
      }
  });
 });
