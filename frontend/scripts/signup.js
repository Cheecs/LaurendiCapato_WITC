$(document).ready(function () {

  $("#showPwd").prop("checked", false);
  handleShowHidePwd();
  redirect();

  async function redirect() {

    let token = sessionStorage.getItem("token");

    if (token) {
      let validToken = await validateToken(token)

      if (validToken)
        window.open("./product.html", "_self");
    }

  }

  $("#signupForm").submit(function (event) {

    event.preventDefault();

    let username = $("#username").val();
    let email = $("#email").val();
    let pwd = $("#password").val();
    let hasPwd = CryptoJS.MD5(pwd).toString();

    let reqBody = {
      mail: email,
      usrName: username,
      pwd: hasPwd
    };

    let request = inviaRichiesta("POST", "/api/signup", reqBody);

    request.fail((err) => {

      showAlert(err.responseJSON.msg);

    });
    request.done(function (data) {

      // salvare i dati utente

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
  });
}