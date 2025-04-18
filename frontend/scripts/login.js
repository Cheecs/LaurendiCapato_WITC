$(document).ready(function() {
    $("#showPwd").prop("checked", false);
    handleShowHidePwd();
  
    $("#signInForm").submit(function(event) {

      event.preventDefault();
  
      let email = $("#email").val();
      let pwd = $("#password").val();
      let hasPwd = CryptoJS.MD5(pwd).toString();
  
      let reqBody = {
        mail: email,
        pwd: hasPwd
      };
      
      let request = inviaRichiesta("POST", "/api/login", reqBody);
      
      request.fail((err) => {

        showAlert(err.responseJSON.msg);

      });
      request.done(function(data) {

        // salvare i dati dell'utente

        window.open("./product.html", "_self")

      });

    });
  });