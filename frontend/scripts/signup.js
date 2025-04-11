$(document).ready(function() {

    $("#showPwd").prop("checked", false);

    emailjs.init({ publicKey: "xOPSL_1APpO9HNhWZ" });

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
        
        let request = inviaRichiesta("POST", "/api/signup", reqBody);
        
        request.fail((err) => {
  
          showAlert(err.responseJSON.msg);
  
        });
        request.done(function(data) {
            
            // salvare i dati utente

            sendMail(email, usrName, "Registrazione avvenuta con successo! \n Siamo felici di accoglierti nella famiglia di WITC");
            window.open("./product.html", "_self")
  
        });
  
      });
});

function sendMail(mail, name, msg){
    

    $("#btnSend").on("click", function () {

        let templateParams = {
            mittente: mail, 
            to_name: name, 
            message: msg, 
        };

        emailjs.send('service_cgo89mc', 'template_lwgxxts', templateParams).then(
            (response) => {
                console.log('SUCCESS!');
            },
            (error) => {
                console.log(`ERROR: ${error.message}`);
            },
        );
    })
}