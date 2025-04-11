function handleShowHideMenu(){
    
    $("#imgUtente").mouseenter(function(){
        $("#tooltip").removeClass("d-none");
    });

    $("#tooltip").mouseleave(function(){
        $(this).addClass("d-none");
    });

    $("#tooltip").mouseenter(function(){
        $(this).removeClass("d-none");
    });
}

function showAlert(msg){

    let divAlert = $("#divAlert");

    $("#errorMsg").text(msg);

    divAlert.removeClass("hideAlert");
    divAlert.addClass("showAlert");

    setTimeout(function(){

        divAlert.addClass("hideAlert");
        divAlert.removeClass("showAlert");

    }, 6000);
}

function handleShowHidePwd(){
    
    const showPwd = document.getElementById("showPwd");
    const pwd = document.getElementById("password");

    showPwd.addEventListener("change", function () {
        if (showPwd.checked) {
            pwd.type = "text";
        }
        else
            pwd.type = "password";
    })
}

function inviaRichiesta(method, url, parameters={}) {
	let contentType;
	if(method.toUpperCase()=="GET")
		contentType="application/x-www-form-urlencoded;charset=utf-8";
	else{
		contentType = "application/json;charset=utf-8"
        parameters = JSON.stringify(parameters);
	}
    return $.ajax({
        "url": url,
		"data": parameters,
		"type": method,   
		"contentType": contentType, 
        "dataType": "json",   // default      
        "timeout": 5000,      // default 
		// L'intestazione content-type NON viene creata di default
		"headers":{"Content-Type":contentType}
    });	
}


function errore(jqXHR, text_status, string_error) {
    if (jqXHR.status == 0)
        alert("Connection Refused or Server timeout");
	else if (jqXHR.status == 200)
        alert("Formato dei dati non corretto : " + jqXHR.responseText);
    else
        alert("Server Error: " + jqXHR.status + " - " + jqXHR.responseText);
}

