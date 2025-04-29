let usrData;

$(document).ready(function(){

    $("#file").on("change", () => {
        changeImg();
    });

    $("#btnAnalizza").on("click", () => {
        
        let imgInfo = extractColor();
        
        writeInTable(imgInfo);
    });

    $("#closePreview").on("click", () => {
        $("#divPreview").addClass("d-none");
        $("#fileInputContainer").removeClass("d-none");
    });

    let token = sessionStorage.getItem("token");

    getUserInfo(token);
});

async function getUserInfo(token) {

    try {

        let usrData = await decodeToken(token);

        $("#mailUsr").text(usrData.mail);

        $("#btnSalvaColore").click(function(){
            console.log(`id utente: ${ usrData.id}`);
        });

    } catch (err) {
        // mostra alert o gestisci errore
        console.error("Errore nel recupero dei dati utente:", err);
    }
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
            console.error("Errore durante la decodifica:", err);
            reject(err);
        });
    });
}

function writeInTable(data){

    let tBodyColor = $("#tBodyColor");
    let tBodyPalette = $("#tBodyPalette");

    /* Main color */

    let tr = $("<tr>");

    let tdColore = $("<td class='tdColor'>");

    let divColore = $("<div class='divColor'></div>");
    divColore.css("backgroundColor", data.colorHEX);
    tdColore.append(divColore);

    let tdRGB = $(`<td class="tdText">${data.colorRGB}</td>`); 
    let tdHEX = $(`<td class="tdText">${data.colorHEX}</td>`);

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

        let tdRGB = $(`<td class="divText">${paletteRGB[i]}</td>`);
        let tdHEX = $(`<td class="tdText">${paletteHEX[i]}</td>`);

        tr.append(tdColore);
        tr.append(tdHEX);
        tr.append(tdRGB);

        tBodyPalette.append(tr);

    }

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
