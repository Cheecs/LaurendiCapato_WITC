window.addEventListener("load", function(){

    document.getElementById("showPwd").checked = false;

    handleShowHidePwd();

    document.getElementById("signInForm").addEventListener("submit", function(event){

        event.preventDefault();

        let email = document.getElementById("email").value;
        let pwd = document.getElementById("password").value;

        let hasPwd = CryptoJS.MD5(pwd).toString();

        let reqBody = {
            mail: email,
            pwd: hasPwd
        };

        let request = inviaRichiesta("POST", "/api/login", reqBody);
        request.fail(errore)
        request.done(function(data){
            console.log(`Logged in: \\n ${data}`);
        });

    })

});