"use strict";

let clicked = false;
let varShowPalette = false;

$(document).ready(function () {

    let token = sessionStorage.getItem("token");

    if (token && token.trim() != "") {
        checkToken(token);
    }
    else
        window.location.href = "./home.html";
});

async function checkToken(token) {

    try {

        let info = await decodeToken(token);

        checkStatus();
        checkShowpalette();
        handleShowHidePwd();

        $("#txtUsername").val(info.usrName);

        $("#changeProfilePic").on("click", function () {
            $("#imgProfileInput")[0].click();
        });

        $(".ImgPrev").click(function () {

            let img = $(this).attr("src");
            $("#imgZoomIn").attr("src", img);
        });

        loadTable();

        $("#txtChangeUsr").val(info.usrName);
        $("#txtChangePwd").val(info.psw);

        if(info.img != null)
            $("#imgProfile").attr("src", info.img);

    } catch (err) {
        window.location.href = "./home.html";
    }


}

function loadTable() {

    let _token = sessionStorage.getItem("token");

    let bodyImages = {
        token: _token
    }

    let immagini = inviaRichiesta("POST", "/api/getImages", bodyImages);

    immagini.done((data) => {

        // scrivi in tabella (ricordati del pulsante)

        let tBody = $("#tBodyColor");

        let immagini = data.data

        immagini.forEach(immagine => {

            let tr = $("<tr>");

            let tdColorName = $(`<td>${immagine.nomeC}</td>`);

            let tdColor = $(`<td></td>`);
            let divColor = $("<div class='colorDiv'>");
            divColor.css("backgroundColor", immagine.cHEX);
            tdColor.append(divColor);

            let tdColorRGB = $(`<td>(${immagine.cRGB})</td>`);
            let tdColorHEX = $(`<td>${immagine.cHEX}</td>`);

            let tdImmagine = $("<td>");
            let img = $("<img class='imgTable'>");
            img.attr("src", immagine.img);
            tdImmagine.append(img);

            let tdButton = $(`<button id="buttonP_${immagine.idP}" class="btn btnShowpalette">Show palette</button>`);

            let tBodyPalette = $(`<tbody id="tbodyP_${immagine.idP}"></tbody>`)

            tr.append(tdColorName);
            tr.append(tdColor);
            tr.append(tdColorHEX);
            tr.append(tdColorRGB);
            tr.append(tdImmagine);
            tr.append(tdButton);
            tr.append(tBodyPalette);

            tBody.append(tr);

        });

    });

    immagini.fail((err) => {
        showAlert("Error while getting images");
    })

}

function checkStatus() {

    if (clicked) {
        const btn = $("#btnEditProfile");
        btn.click(function () {
            HideEdit();
        });

        $("#cancel").click(function () {
            HideEdit();
        })
    }
    else {
        const btn = $("#btnEditProfile");
        btn.click(function () {
            ShowEdit();
        });
    }
}

function ShowEdit() {

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

function HideEdit() {

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

function checkShowpalette() {

    if (varShowPalette) {
        const btn = $("#btnShowpalette");
        btn.click(function () {
            hidePalette();
        });
    }
    else {
        const btn = $("#btnShowpalette");
        btn.click(function () {
            showPalette();
        });
    }

}

function hidePalette() {

    const btn = $("#btnShowpalette");
    btn.text("Show palette");

    $(".divShowPalette").empty();


    varShowPalette = false;
    $("#paletteTableDiv").removeClass("divTable");
    checkShowpalette();
}

function showPalette() {

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


    for (let i = 0; i < 10; i++) {

        const tr = $(`<tr>`);
        const td = $("<td></td><td>ciao</td><td>ciao</td><td>ciao</td><td></td>");

        tr.append(td);
        divPal.append(tr)
    }



    varShowPalette = true;
    checkShowpalette();
}

function decodeToken(_token) {

    let reqBody = {
        token: _token
    };

    return new Promise((resolve, reject) => {

        let request = inviaRichiesta("POST", "/api/decodeToken", reqBody);

        request.done((data) => {
            resolve(data.data);
        });

        request.fail((err) => {
            reject(err);
        });
    });
}
