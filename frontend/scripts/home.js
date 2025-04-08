let seeMore = false;

$(document).ready(function(){

    UIsetup();

});

function UIsetup(){

    $("#imgUtente").mouseenter(function(){
        $("#tooltip").removeClass("d-none");
    });

    $("#tooltip").mouseleave(function(){
        $(this).addClass("d-none");
    });

    $("#tooltip").mouseenter(function(){
        $(this).removeClass("d-none");
    });

    $("#seeMoreBtn").click(function(){
        handleSeeMoreAnimation();
    });
    
    $('#year').text(new Date().getFullYear());
}


function handleSeeMoreAnimation(){

    const containerShortInfo = $("#containerShortInfo");
    const infoCards = $("#infoCards");
    const divInfo = $("#divInfo");
    const divRev = $("#divRev")

    if(seeMore == false){
        
        divRev.removeClass("slideUp");
        divRev.addClass("slideDown");

        setTimeout(function(){    

            containerShortInfo.removeClass("slideCenter");
            containerShortInfo.addClass("slideLeft");
            containerShortInfo.removeClass("alignCenterShortInfo");
            containerShortInfo.addClass("alignShortInfo");
    
            divInfo.addClass("alignCards");
    
            infoCards.removeClass("fadeOut");
            infoCards.addClass("fadeIn");
            infoCards.removeClass("d-none");

            
            $("#seeMoreBtn").text("See less");

        }, 140);

        seeMore = true;
    }
    else{

        divRev.addClass("slideUp");
        divRev.removeClass("slideDown");

        setTimeout(function(){

            containerShortInfo.removeClass("slideLeft");
            containerShortInfo.addClass("slideCenter");
    
            infoCards.addClass("fadeOut");
            infoCards.removeClass("fadeIn");

        }, 140);

        setTimeout(function(){

            infoCards.addClass("d-none");

            containerShortInfo.removeClass("alignShortInfo");
            containerShortInfo.addClass("alignCenterShortInfo");

            containerShortInfo.removeClass("slideCenter");
    
            divInfo.removeClass("alignCards");

            $("#seeMoreBtn").text("See more");
            
        }, 600);  

        seeMore = false;
    }

}