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

        showAlert(err.msg);
        console.log(err.msg.json());

      });
      request.done(function(data) {

        console.log(`Logged in:`, data.data);
        window.open("./product.html", "_self")

      });

    });
  });