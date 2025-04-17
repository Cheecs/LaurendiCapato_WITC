$(document).ready(function(){

    $("#file").on("change", () => {
        changeImg();
    });

    $("#btnAnalizza").on("click", () => {
        
        let imgInfo = extractColor();
        
        writeInTable(imgInfo);
    });

});

function writeInTable(data){

    console.log(data);

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

}
