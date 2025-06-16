let seeMore = false;
let showMoreRev = true;

$(document).ready(function(){

    UIsetup();
 
    writeReviews();

    let token = sessionStorage.getItem("token");

    if(token && token.trim() != "")
    {
        getUserInfo(token);
    }

    $("#btnShowMoreRev").click(function () {

        if(showMoreRev)
        {
            $("#btnShowMoreRev").text("Show less reviews");
            $("#showAllReviews").removeClass("d-none");

            showMoreRev = false;
        }
        else
        {
            $("#btnShowMoreRev").text("Show more reviews");
            $("#showAllReviews").addClass("d-none");

            showMoreRev = true;
        }

    })

});

function writeReviews(){

    let req = inviaRichiesta("GET", "/api/getAllReviews");

    let revBody = $("#showAllReviews");

    req.done((data) => {

        console.log(data);

        let reviews = data.data;

        reviews.forEach(rev => {

            let stars;
            let data = formatDate(rev.Data);

            for(let i = 0; i < rev.Valutazione; i++)
            {
                stars += "★";
            }

            let review = $(`
                <div class="card testimonial-card mb-2">
                    <div class="card-body p-3">
                      <div class="d-flex align-items-center mb-3">
                        <div class="avatar me-3">
                          <img src="${rev.Img}">
                        </div>
                        <div>
                          <h5 class="card-title mb-0">${rev.Nickname}</h5>
                        </div>
                      </div>
                      <div>
                        <span class="text-secondary">${data}</span>
                      </div>
                      <div class="stars mb-3">
                        ${stars}
                      </div>
                      <p class="card-text text-light mb-3">
                        ${rev.Descr}
                      </p>
                    </div>
                </div>`);

            revBody.append(review);
            
        });
    });

    req.fail(() => {
        showAlert("Error while getting reviews");
    })

}

function formatDate(date){

    let data = date.split(' ');
    let dateArray = data.split('-');

    return `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`;
}

async function getUserInfo(token) {

    try {

        let usrData = await decodeToken(token);

        getProfilePic(usrData.id);

        $("#imgUtente").attr("title", usrData.mail);
        $("#imgUtente").tooltip("dispose").tooltip();

        $("#imgUtente").click(() => {
            window.location.href = "./profile.html";
        })

        $("#btnWriteReview").click(function () {

            const selectedStars = $('.star:checked');

            const stelle = selectedStars.val();
            const userId = usrData.id;
            const review = $("#txtReview").val();

            let reqBody = {
                stars: stelle,
                id: userId,
                text: review,
                token: token,
            };

            if (stelle > 0) {
                inviaRecensione(reqBody);
            } else {
                console.log('Nessuna stella selezionata');
            }
        });


    } catch (err) 
    {   
        loggedIn = false;
    }
}

function inviaRecensione(reqBody){

    let req = inviaRichiesta("POST", "/api/sendReview", reqBody);

    req.done(() => {
        location.reload();
    });

    req.fail(() => {
        showAlert("An error occured while sending review");
    }) 
}

async function getProfilePic(id) {
    try {
        let token = sessionStorage.getItem("token");
        if (!token) {
            $("#imgUtente").attr("src", "./images/user.png");
            return;
        }

        let reqBody = { token };
        let request = inviaRichiesta("POST", "/api/getProfile", reqBody);

        request.done((data) => {
            if (data.data && data.data.Img && data.data.Img !== "")
                $("#imgUtente").attr("src", data.data.Img);
            else
                $("#imgUtente").attr("src", "./images/user.png");
        });

        request.fail((err) => {
            console.error(err);
            $("#imgUtente").attr("src", "./images/user.png");
        });
    } catch (err) {
        console.error(err);
        $("#imgUtente").attr("src", "./images/user.png");
    }
}


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
