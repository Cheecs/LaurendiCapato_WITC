$(document).ready(async function () {

  $("#showPwd").prop("checked", false);
  handleShowHidePwd();

  let token = sessionStorage.getItem("token");

  if(token)
  {
    let validToken = await validateToken(token)

    if(validToken)
      window.location.href = "./product.html";

  }

  $("#signInForm").submit(function (event) {

    event.preventDefault();


    let email = $("#email").val();
    let pwd = $("#password").val();
    let hasPwd = CryptoJS.MD5(pwd).toString();

    let reqBody = {
      mail: email,
      pwd: hasPwd
    };

    let request = inviaRichiesta("POST", "/api/login", reqBody);

    request.fail((err) => {

      showAlert(err.responseJSON.msg);
      console.log(err);

    });
    request.done(function (data) {

      // salvare i dati dell'utente

      sessionStorage.setItem("token", data.token);
      window.open("./product.html", "_self");

    });

  });
});

function validateToken(_token) {

  let reqBody = {
    token: _token
  };

  return new Promise((resolve, reject) => {
    let request = inviaRichiesta("POST", "/api/decodeToken", reqBody);

    request.done((data) => {
      resolve(data.data, true);
    });

    request.fail((err) => {
      reject(err, false);
    });
  });
}
