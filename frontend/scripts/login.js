$(document).ready(function() {
  
    $("#showPwd").prop("checked", false);
    handleShowHidePwd();

      let token = sessionStorage.getItem("token");

      if(token)
        console.log(token);
        //window.location.href = "./product.html";
  
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
        console.log(err);

      });
      request.done(function(data) {

        // salvare i dati dell'utente

        sessionStorage.setItem("token", data.token);
        window.open("./product.html", "_self");

      });

    });
  });