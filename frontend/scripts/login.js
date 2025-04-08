window.addEventListener("load", function(){

    document.getElementById("showPwd").checked = false;

    handleShowHidePwd();

    document.getElementById("signInForm").addEventListener("submit", function(event){

        event.preventDefault();

        console.log("submit");
    })

});