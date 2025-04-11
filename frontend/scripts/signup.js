$(document).ready(function() {

    $("#showPwd").prop("checked", false);

    handleShowHidePwd();

    $("#signupForm").submit(function(event) {

        event.preventDefault();
    
        let username = $("#username").val();
        let email = $("#email").val();
        let pwd = $("#password").val();
        let hasPwd = CryptoJS.MD5(pwd).toString();
    
        let reqBody = {
          mail: email,
          usrName: username,
          pwd: hasPwd
        };

        console.log(reqBody);
        
        let request = inviaRichiesta("POST", "/api/signup", reqBody);
        
        request.fail((err) => {
  
          showAlert(err.responseJSON.msg);
  
        });
        request.done(function(data) {
  
          console.log(`Logged in:`, data.data);
        //   window.open("./product.html", "_self")
  
        });
  
      });
});