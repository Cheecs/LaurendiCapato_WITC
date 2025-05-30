"use strict";

let clicked = false;
let varShowPalette = false;

$(document).ready(function () {

    $("#paletteTable").removeClass("d-none");
    $("#noImages").addClass("d-none");

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
        handleShowHidePwd();

        $("#txtUsername").text(info.usrName);

        $("#changeProfilePic").on("click", function () {
            $("#imgProfileInput")[0].click();
        });

        loadTable();

        $("#txtChangeUsr").val(info.usrName);

        if (info.img != null)
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

    let request = inviaRichiesta("POST", "/api/getImages", bodyImages);

    request.done((data) => {

        let tBody = $("#tBodyColor");

        let immagini = data.data

        if (immagini.length > 0) {
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
                let img = $("<img class='imgTable' data-bs-target='#ImgModal' data-bs-toggle='modal'>");
                img.attr("src", immagine.Img);

                img.click(function () {

                    let prevImg = $(this).attr("src");
                    $("#imgZoomIn").attr("src", prevImg);
                });
                tdImmagine.append(img);

                let tBodyPalette = $(`<tbody class="divShowPalette" id="tbodyP_${immagine.idP}"></tbody>`)


                let tdButton = $("<td>");
                let button = $(`<button id="buttonP_${immagine.idP}" class="btn btnShowpalette">Show palette</button>`);
                tdButton.append(button);

                button.click(function () {

                    let varShowPalette = false;

                    if (varShowPalette) {
                        varShowPalette = false;
                        hidePalette();
                    }
                    else {
                        varShowPalette = true;
                        let id = $(this).attr("id");
                        showPalette(id, tBodyPalette);
                    }
                });

                tr.append(tdColorName);
                tr.append(tdColor);
                tr.append(tdColorHEX);
                tr.append(tdColorRGB);
                tr.append(tdImmagine);
                tr.append(tdButton);
                tr.append(tBodyPalette);

                tBody.append(tr);

            });

            $("#imgAnalizzate").text(`Immagini analizzate: ${immagini.length}`);
        }
        else {
            $("#paletteTable").addClass("d-none");
            $("#noImages").removeClass("d-none");
        }

    });

    request.fail((err) => {
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

function hidePalette() {

    $("#btnShowpalette").text("Show palette");

    $(".divShowPalette").empty();

    $("#paletteTableDiv").removeClass("divTable");
}

function showPalette(id, tBody) {

    $("#btnShowpalette").text("Hide palette");

    let _token = sessionStorage.getItem("token");
    let paletteId = id.split('_')[1];

    let bodyPalette = {
        token: _token,
        idP: paletteId
    }

    let palette = inviaRichiesta("POST", "/api/getPalette", bodyPalette);

    palette.done((data) => {

        let colori = data.data;
        let paletteName = colori[0].nomeP;

        let trNomeP = $("<tr>");
        let th = $("<th>Nome palette: </th>");
        let tdNome = $(`<td>${paletteName}</td>`);

        let emptyCell1 = $("<td>");
        let emptyCell2 = $("<td>");
        let emptyCell3 = $("<td>");

        trNomeP.append(th);
        trNomeP.append(tdNome);
        trNomeP.append(emptyCell1);
        trNomeP.append(emptyCell2);
        trNomeP.append(emptyCell3);

        tBody.append(trNomeP);

        // colori.forEach(colore => {

        //     let tr = $("<tr>");

        //     let emptyCell1 = $("<td>");
        //     let emptyCell2 = $("<td>");

        //     let tdColor = $(`<td></td>`);
        //     let divColor = $("<div class='colorDiv'>");
        //     divColor.css("backgroundColor", colore.cHEX);
        //     tdColor.append(divColor);

        //     let tdColorRGB = $(`<td>(${colore.cRGB})</td>`);
        //     let tdColorHEX = $(`<td>${colore.cHEX}</td>`);

        //     tr.append(emptyCell1);
        //     tr.append(tdColor);
        //     tr.append(tdColorHEX);
        //     tr.append(tdColorRGB);
        //     tr.append(emptyCell2);

        //     tBody.append(tr);
        // });

    });

    palette.fail((err) => {
        showAlert("Error while getting images");
    })

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
