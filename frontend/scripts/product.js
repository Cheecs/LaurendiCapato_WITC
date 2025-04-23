$(document).ready(function(){

    handleShowHideMenu();

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
    let usrData = decodeToken(token);

    $("#mailUsr").text(usrData.mail)
});

function decodeToken(_token){

    let reqBody = {
        token: _token
    };

    let request = inviaRichiesta("POST", "/api/decodeToken", reqBody);
    request.fail((err) => {

        // da fare lo show alert
        
        console.log(err);
    });

    request.done((data) => {

        return data.token
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
