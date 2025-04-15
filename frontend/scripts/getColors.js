const rgbToHex = (r, g, b) => '#' + [r, g, b].map(x => {

    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex

}).join('');

$(document).ready(() => {

    // $("#imgInput").on("change", changeImg);
    // $("#btn-visualizza").on("click", extractColor);

});

// function changeImg() {

//     const fileInput = document.getElementById("imgInput");
//     let imgPreview = fileInput.files[0];

//     if (imgPreview) {
//         let reader = new FileReader();

//         reader.readAsDataURL(imgPreview);

//         reader.onload = function (e) {
//             let tempImg = document.getElementById("preview");
//             tempImg.src = e.target.result;
//             tempImg.style.height = "400px";
//             tempImg.style.width = "auto";
//         }
//     }

// }

function extractColor() {

    const colorThief = new ColorThief();
    let img;
    let palette = new Object();
    let color;

    img = document.getElementById("preview");

    /* -- PALETTE -- */
    if (img.complete) {

        palette = colorThief.getPalette(img);

    } else {

        img.addEventListener('load', function () {
            palette = colorThief.getPalette(img);
        });

    }


    /* -- SINGOLO COLORE -- */
    if (img.complete) {

        color = colorThief.getColor(img);

    } else {

        img.addEventListener('load', function () {
            color = colorThief.getColor(img);
        });

    }

    if (palette.length >= 2) {

        let divColors = document.getElementById("colors");
        // div.style.background = "rgb(" + palette[i][0] + ", " + palette[i][1] + ", " + palette[i][2] + ")";
        // div.setAttribute("title", rgbToHex(palette[i][0], palette[i][1], palette[i][2]));
        // a.innerText = rgbToHex(palette[i][0], palette[i][1], palette[i][2]);

        // console.log("rgb(" + palette[i][1] + ", " + palette[i][2] + ", " + palette[i][3] + ")");


    }

    // mainColor.style.backgroundColor = "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
    mainColor.setAttribute("title", rgbToHex(color[0], color[1], color[2]));
    // aMC.innerText = rgbToHex(color[0], color[1], color[2]);


}


function svuotaDiv() {
    $("#colors").empty();
    $("#mainColor").empty();
}