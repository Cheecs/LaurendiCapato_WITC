"use strict";

let clicked = false;
let varShowPalette = false;

$(document).ready(function(){

    checkStatus();  
    checkShowpalette();   
    handleShowHidePwd(); 

    $("#changeProfilePic").on("click", function() {
        $("#imgProfileInput")[0].click();
    });

    $(".ImgPrev").click(function(){

        let img = $(this).attr("src");
        $("#imgZoomIn").attr("src", img);
    });

    loadTable();
});

function laodTable(){

    let _token = sessionStorage.getItem("token");
    let bodyImages = {
        token: _token
    }

    let immagini = inviaRichiesta("POST", "/api/getImages", bodyImages);

    immagini.done((data) => {

        // scrivi in tabella (ricordati del pulsante)

        console.log(data);

    });

    immagini.fail((err) => {
        showAlert("Error while getting images");
    })

}

function checkStatus(){

    if(clicked){
        const btn = $("#btnEditProfile");
        btn.click(function(){
            HideEdit();
        });

        $("#cancel").click(function() {
            HideEdit();
        })
    }
    else{
        const btn = $("#btnEditProfile");
        btn.click(function(){
            ShowEdit();
        });
    }
}

function ShowEdit(){
    const btn = $("#btnEditProfile");
    btn.text("Show less");

    $("#username").prop("disabled", false);
    $("#password").prop("disabled", false);
    $("#showPwd").prop("disabled", false);
    $("#save").prop("disabled", false);
    $("#cancel").prop("disabled", false);
    
    $(".divForm").removeClass("d-none");
    clicked = true;
    checkStatus();
}

function HideEdit(){
    const btn = $("#btnEditProfile");
    btn.text("Edit Profile");
    
    $("#username").prop("disabled", true);
    $("#password").prop("disabled", true);
    $("#showPwd").prop("disabled", true);
    $("#save").prop("disabled", true);
    $("#cancel").prop("disabled", true);

    $(".divForm").addClass("d-none");
    clicked = false;
    checkStatus();
}

function checkShowpalette(){

    if(varShowPalette){
        const btn = $("#btnShowpalette");
        btn.click(function(){
            hidePalette();
        });
    }
    else{
        const btn = $("#btnShowpalette");
        btn.click(function(){
            showPalette();
        });
    }
    
}

function hidePalette(){

    const btn = $("#btnShowpalette");
    btn.text("Show palette");

    $(".divShowPalette").empty();
    
    
    varShowPalette = false;
    $("#paletteTableDiv").removeClass("divTable");
    checkShowpalette();
}

function showPalette(){

    let _token = sessionStorage.getItem("token");
    let bodyPalette = {
        token: _token
    }

    let palette = inviaRichiesta("POST", "/api/getPalette", bodyPalette);

    palette.done(() => {

        // scrivi in tabella delle palette

    });

    palette.fail((err) => {
        showAlert("Error while getting images");
    })


    const btn = $("#btnShowpalette");
    const divPal = $(".divShowPalette");

    $("#paletteTableDiv").addClass("divTable");
    

    btn.text("Hide palette");

    let trNome = $("<tr>");
    let tdNome = $("<th>Nome Palette:</th><td>[nome]</td><td></td><td></td><td></td>");

    trNome.append(tdNome);
    divPal.append(trNome);


    for(let i = 0; i < 10; i++){

        const tr = $(`<tr>`);
        const td = $("<td></td><td>ciao</td><td>ciao</td><td>ciao</td><td></td>");

        tr.append(td);
        divPal.append(tr)
    }

    
    
    varShowPalette = true;
    checkShowpalette();

}