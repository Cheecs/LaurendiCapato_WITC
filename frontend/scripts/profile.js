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
    })
})

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
    const btn = $("#btnShowpalette");
    const divPal = $(".divShowPalette");

    $("#paletteTableDiv").addClass("divTable");
    

    btn.text("Hide palette");

    for(let i = 0; i < 10; i++){

        const tr = $(`<tr>`);
        const td = $("<td>ciao</td><td>ciao</td><td>ciao</td><td>ciao</td><td>ciao</td>");

        tr.append(td);
        divPal.append(tr)
    }

    
    
    varShowPalette = true;
    checkShowpalette();

}