"use strict";

let clicked = false;

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

        $("#deleteBtn").click(function(){
            deleteUser(info.id);
        });

        $("#save").click(function(){
            updateUser(info.id);
        });

        $("#logout").click(() => {
            sessionStorage.removeItem("token");
            window.location.href = "./home.html";
        })

        $("#btnAnalyzeImage").click(() => {
            window.location.href = "./product.html";
        })

        $("#imgProfileInput").change(function () {

            const fileInput = $(this)[0].files[0];

            if (fileInput) {

                const reader = new FileReader();

                reader.readAsDataURL(fileInput);

                reader.onload = function (e) {
                    $("#imgProfile").attr("src", e.target.result);
                }
            }
        });

        loadTable();

        $("#txtChangeUsr").val(info.usrName);

        getProfilePic(info.id);

        if (info.img != null)
            $("#imgProfile").attr("src", info.img);

    } catch (err) {
        window.location.href = "./home.html";
    }


}

async function getProfilePic(id) {

    try {
        let token = sessionStorage.getItem("token");
        if (!token) {
            $("#imgProfile").attr("src", "../img/defaultProfile.png");
            return;
        }

        let reqBody = { token };
        let request = inviaRichiesta("POST", "/api/getProfile", reqBody);

        request.done((data) => {

            if (data.data && data.data.Img && data.data.Img !== null)
            {
                $("#imgProfile").attr("src", data.data.Img);
                $("#imgUtente").attr("src", data.data.Img);
            }
            else
            {
                $("#imgProfile").attr("src", "../img/defaultProfile.png");
                $("#imgUtente").attr("src", "../img/defaultProfile.png");
            }
        });

        request.fail((err) => {
            console.error(err);
            $("#imgProfile").attr("src", "../img/defaultProfile.png");
            $("#imgUtente").attr("src", "../img/defaultProfile.png");
        });
    } catch (err) {
        console.error(err);
        $("#imgProfile").attr("src", "../img/defaultProfile.png");
        $("#imgUtente").attr("src", "../img/defaultProfile.png");
    }
}

async function updateUser(id){

    let token = sessionStorage.getItem("token");
    let username = $("#txtChangeUsr").val();
    let psw = $("#txtChangePwd").val();
    let newImg;

    if($("#imgProfile").attr("src") == "../img/defaultProfile.png")
        newImg = null;
    else
    {
        let img = $("#imgProfileInput")[0].files[0];
        newImg = await imgToBase64(img);
    }

    let reqBody = {
        idU: id,
        usr: username,
        pwd: psw,
        img: newImg,
        token:token
    }

    let request = inviaRichiesta("PATCH", "/api/updateUser", reqBody);

    request.done(() => {
        sessionStorage.removeItem("token");
        window.location.href = "./login.html";
    });

    request.fail(() => {

        showAlert("An error occured during the update");
    })

}

function deleteUser(id){

    let token = sessionStorage.getItem("token");

    let reqBody = {
        idU: id,
        token: token
    }

    let request = inviaRichiesta("DELETE", "/api/deleteUser", reqBody);

    request.done(() => {

        window.location.href = "./home.html"
    });

    request.fail(() => {
        showAlert("An error occured while deleting");
    })
}

function loadTable() {

    let _token = sessionStorage.getItem("token");
    let tBody = $("#tBodyColor");
    tBody.empty();

    let bodyImages = {
        token: _token
    }

    let request = inviaRichiesta("POST", "/api/getImages", bodyImages);

    request.done((data) => {

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

                let tdButton = $("<td>");
                let button = $(`<button id="buttonP_${immagine.idP}" class="btn btnShowpalette" data-bs-target="#PaletteModal" data-bs-toggle="modal">Show palette</button>`);
                tdButton.append(button);

                button.click(function () {

                        let id = $(this).attr("id");
                        showPalette(id);
                });

                // fai modale per modifica o eliminazione
                let tdButtonMod = $("<td>");
                let buttonMod = $(`<button id="id_${immagine.idP}_${immagine.idI}" class="btn secondary-btn" data-bs-target="#ModifyModal" data-bs-toggle="modal">Modify</button>`);
                tdButtonMod.append(buttonMod);

                buttonMod.click(function(){

                    let idP = $(this).attr("id").split('_')[1];
                    let idI = $(this).attr("id").split('_')[2];

                    setUpUpdateDelete(idP, idI);
                })

                tr.append(tdColorName);
                tr.append(tdColor);
                tr.append(tdColorHEX);
                tr.append(tdColorRGB);
                tr.append(tdImmagine);
                tr.append(tdButton);
                tr.append(tdButtonMod);

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

function setUpUpdateDelete(idP, idI){

    let token = sessionStorage.getItem("token");

    $("#updateBtn").click(function(){

        let nomeColore = $("#txtChangeColorName").val();
        let nomePalette = $("#txtChangePaletteName").val();

        if(nomeColore.trim() == "")
            nomeColore = "Colore";

        if(nomePalette.trim() == "")
            nomePalette = "Palette";
        
        let reqBodyUpdate = {
            idP: idP,
            idI: idI,
            colore: nomeColore,
            palette: nomePalette,
            token: token
        };

        let request = inviaRichiesta("PATCH", "/api/updateColorPalette", reqBodyUpdate);

        request.done(() => {

            loadTable();
        });

        request.fail(() => {

            showAlert("An error occured during the update");
        });
    });

    $("#deleteBtn").click(function(){
        
        let reqBodyDelete = {
            idP: idP,
            idI: idI,
            token: token
        };

        let request = inviaRichiesta("DELETE", "/api/deleteColorPalette", reqBodyDelete);

        request.done(() => {

            loadTable();
        });

        request.fail(() => {

            showAlert("An error occured during the delete");
        });
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

function showPalette(id) {

    let _token = sessionStorage.getItem("token");
    let paletteId = id.split('_')[1];
    let tBody = $("#tBodyPalette");

    tBody.empty();

    let bodyPalette = {
        token: _token,
        idP: paletteId
    }

    let palette = inviaRichiesta("POST", "/api/getPalette", bodyPalette);

    palette.done((data) => {

        let colori = data.data;
        let paletteName = colori[0].NomeP;

        $("#paletteName").text(`Palette: ${paletteName}`);

        colori.forEach(colore => {

            let tr = $("<tr>");

            let tdColor = $(`<td></td>`);
            let divColor = $("<div class='colorDiv'>");
            divColor.css("backgroundColor", colore.cHEX);
            tdColor.append(divColor);

            let tdColorRGB = $(`<td>(${colore.cRGB})</td>`);
            let tdColorHEX = $(`<td>${colore.cHEX}</td>`);

            tr.append(tdColor);
            tr.append(tdColorHEX);
            tr.append(tdColorRGB);

            tBody.append(tr);
        });

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

function imgToBase64(img) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(img);

    });
}
