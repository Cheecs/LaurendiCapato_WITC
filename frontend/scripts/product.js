let loggedIn;
let analized;

$(document).ready(function(){

    $('[data-toggle="tooltip"]').tooltip();

    $("#file").on("change", () => {
        changeImg();
    });

    $("#btnAnalizza").on("click", () => {
        
        let imgInfo = extractColor();

        analized = true;

        let btnSalva = $("#btnSalva");

        if(loggedIn)
        {
            btnSalva.attr("data-bs-toggle", "modal");
            btnSalva.attr(" data-bs-target", "#SaveModal");
        }
        else
        {
            btnSalva.attr("data-bs-toggle", "modal");
            btnSalva.attr("data-bs-target", "#LoginModal");    
        }
        
        writeInTable(imgInfo);
    });

    $("#closePreview").on("click", () => {

        $("#divPreview").addClass("d-none");
        $("#fileInputContainer").removeClass("d-none");

        clearTables();
        analized = false;

        $("#btnSalva").removeAttr("data-bs-toggle");
        $("#btnSalva").removeAttr("data-bs-target");
    });

    $("#btnSalva").click(function() {

        if(!analized)
            showAlert("Analizzare l'immagine");

    });

    let token = sessionStorage.getItem("token");

    if(token && token.trim() != "")
    {
        getUserInfo(token);
    }
    else
    {
        loggedIn = false;
    }

});

async function getUserInfo(token) {

    try {

        let usrData = await decodeToken(token);

        $("#imgUtente").attr("title", usrData.mail);
        $("#imgUtente").tooltip("dispose").tooltip();

        $("#btnSalva").click(function(){

            console.log("ok")

            const img = $("#file")[0].files[0];

            saveColor(usrData.id, img);
        });

    } catch (err) {
        showAlert("Errore nel recupero dei dati utente");
    }
}

async function saveColor(id, img){

    let promiseResponse = await imgToBase64(img);
    let imgBase64 = promiseResponse.split(',')[1];

    let colorHEX = $(".mainColorHEX").text();
    let colorRGB = $(".mainColorRGB").text();

    let colorsRGB = $(".rgbColors").text();
    let colorsHEX = $(".hexColors").text();

    console.log(`id utente`);
    console.log(`img base64: ${imgBase64}`);
    console.log(`color: ${colorHEX}`);
    console.log(`color: ${colorRGB}`);
    console.log(`palette: ${colorsHEX}`);
    console.log(`palette: ${colorsRGB}`);
}

function imgToBase64(img) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(img);

    });
}


function decodeToken(_token){

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

function writeInTable(data){

    clearTables()

    let tBodyColor = $("#tBodyColor");
    let tBodyPalette = $("#tBodyPalette");

    /* Main color */

    let tr = $("<tr>");

    let tdColore = $("<td class='tdColor'>");

    let divColore = $("<div class='divColor'></div>");
    divColore.css("backgroundColor", data.colorHEX);
    tdColore.append(divColore);

    let tdRGB = $(`<td class="tdText mainColorRGB">${data.colorRGB}</td>`); 
    let tdHEX = $(`<td class="tdText mainColorHEX">${data.colorHEX}</td>`);

    tr.append(tdColore);
    tr.append(tdHEX);
    tr.append(tdRGB);

    tBodyColor.append(tr);

    /* Palette */

    let paletteHEX = data.paletteHEX;
    let paletteRGB = data.paletteRGB;
    
    for(let i = 0; i < paletteHEX.length; i++){

        let tr = $("<tr>");

        let tdColore = $("<td class='tdColor'>");

        let divColore = $("<div class='divColor'></div>");
        divColore.css("backgroundColor", paletteHEX[i]);
        tdColore.append(divColore);

        let tdRGB = $(`<td class="tdText rgbColors">${paletteRGB[i]} </td>`);
        let tdHEX = $(`<td class="tdText hexColors">${paletteHEX[i]} </td>`);

        tr.append(tdColore);
        tr.append(tdHEX);
        tr.append(tdRGB);

        tBodyPalette.append(tr);

    }

}

function clearTables(){

    let tBodyColor = $("#tBodyColor");
    let tBodyPalette = $("#tBodyPalette");

    tBodyColor.empty();
    tBodyPalette.empty();
}

function changeImg() {

    const fileInput = $("#file")[0].files[0];

    if (fileInput) {

        const reader = new FileReader();

        reader.readAsDataURL(fileInput);

        reader.onload = function(e) {
            $("#divPreview").removeClass("d-none");
            $("#imgPreview").attr("src", e.target.result);
        }
    }

    $("#fileInputContainer").addClass("d-none");

}
