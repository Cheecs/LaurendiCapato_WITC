let seeMore = false;

$(document).ready(function(){

    UIsetup();

});

function UIsetup(){

    $("#seeMoreBtn").click(function(){
        handleSeeMoreAnimation();
    });

    $(window).on('resize', function() {

        checkWindow()
    });

    checkWindow();
    
    $('#year').text(new Date().getFullYear());
}

function handleSeeMoreAnimation(){

    const containerShortInfo = $("#containerShortInfo");
    const infoCards = $("#infoCards");
    const divInfo = $("#divInfo");
    const divRev = $("#divRev");

    if ($(window).width() <= 1004) {

        if(seeMore == false){
        
            setTimeout(function(){    
    
                containerShortInfo.removeClass("slideCenter");
                containerShortInfo.addClass("slideLeft");

        
                divInfo.addClass("alignCards");
        
                infoCards.removeClass("fadeOut");
                infoCards.addClass("fadeIn");
                infoCards.removeClass("d-none");
    
                
                $("#seeMoreBtn").text("See less");
    
            }, 140);
    
            seeMore = true;
        }
        else{

            infoCards.addClass("fadeOut");
            infoCards.removeClass("fadeIn");  

            setTimeout(function(){
    
                infoCards.addClass("d-none");

                containerShortInfo.removeClass("slideLeft");
                containerShortInfo.addClass("slideCenter");
        
                containerShortInfo.removeClass("slideCenter");
        
                divInfo.removeClass("alignCards");
    
                $("#seeMoreBtn").text("See more");
                
            }, 320);  
    
            seeMore = false;
        }
    

    }
    else{

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


}

function checkWindow(){

    if ($(window).width() <= 1004) {

        $("#infoCards").removeClass("col-4");
        $("#infoCards").addClass("col-10");

    } else {

        $("#infoCards").removeClass("col-10");
        $("#infoCards").addClass("col-4");

    }
}
