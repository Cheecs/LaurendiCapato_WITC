import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2';
import nodemailer from 'nodemailer'
import jwt from "jsonwebtoken";
import { createHash } from 'crypto';

const privateKey = process.env.PRIVATE_KEY!;
const DURATA_TOKEN = 900; // secondi

// DEBUG THE ENVS
dotenv.config();

const PORT = process.env.PORT || 4000;
const PWD = process.env.DB_passwd;
const SERVER = process.env.DB_host;

let app = express();
app.use(express.json({ limit: '1000mb' }));
app.use(express.urlencoded({ limit: '1000mb', extended: true }));

// Configure the mailer service
const mailerService = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // e.g., 'smtp.gmail.com'
    port: parseInt(process.env.SMTP_PORT || '587'), // e.g., 587 for TLS
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // SMTP username
        pass: process.env.SMTP_PASS, // SMTP password
    },
});

console.log({
    host: process.env.SMTP_HOST, // e.g., 'smtp.gmail.com'
    port: parseInt(process.env.SMTP_PORT || '587'), // e.g., 587 for TLS
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // SMTP username
        pass: process.env.SMTP_PASS, // SMTP password
    },
})

const db = mysql.createPool({
    host: SERVER,
    user: 'root',
    password: PWD,
    database: 'witc',
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 10
});

app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});

// test endpoint
app.get('/api', (req, res) => {
    res.send('API attiva!');
});

/* -- ENDPOINT UTENTI -- */

// Login
app.post('/api/login', async (req, res) => {

    req.setTimeout(300000);

    let { mail, pwd } = req.body;
    let query = "SELECT `idU`,`Nickname`,`Email`,`Password` FROM utenti WHERE Email = ? AND Password = ?"
    let login = await UserExists(mail, pwd, query);

    if (login.status == 200) {
        let token = createToken(login.loginInfo[0]);

        res.setHeader("authorization", token);
        res.setHeader("access-control-expose-headers", "authorization"); // dice al client di leggere l'authorization  

        res.status(login.status).json({
            token: token
        });
    }
    else if (login.status == 404) {
        res.status(login.status).json({
            msg: login.loginInfo
        });
    }
    else if (login.status == 500) {
        res.status(login.status).json({
            msg: login.loginInfo
        });
    }
});

// registrazione
app.post('/api/signup', async (req, res) => {

    let { mail, pwd, usrName } = req.body;
    let query = "INSERT INTO utenti(Nickname, Email, Password, Img) VALUES(?, ?, ?, null)";
    let checkUser = "SELECT * FROM utenti WHERE Email = ?"
    let login = await UserExists(mail, "", checkUser);

    if (login.status == 404) {
        db.query(query, [usrName, mail, pwd], (err, results) => {

            if (err) {
                res.status(500).json({
                    msg: "Server error, please try again"
                });
            }

            if (results) {
                // Send a signup email

                mailerService.sendMail({
                    to: mail, // recipient's email
                    from: process.env.SMTP_FROM || 'noreply@witc.connectify.it', // sender address
                    subject: 'Welcome to WITC!', // Subject line
                    html: `<p>Ciao ${usrName}!</p>
                    <p style="padding: 12px;">Registrazione avvenuta con successo! \n Siamo felici di accoglierti nella famiglia di WITC</p>
                    <div style="display: flex; flex-direction: column; justify-content: center; align-items: end; margin-right:30px; ">
                    <div style="border:1px solid lightgray; padding:10px; border-radius:15px;">
                        <p style="margin-top:-1;">Team di WITC</p>
                    <img style="height:100px; width: 100px; margin-top: -20px; margin-bottom: -15px;" src="https://witc.connectify.it/img/Logo_WITC_NoBG.png" />
                    </div>
                    </div>`, // HTML body
                }, (emailErr, info) => {

                    if (emailErr) {
                        console.error('Error sending email:', emailErr);
                    }
                });

                let token = createToken(results);

                res.setHeader("authorization", token);
                res.setHeader("access-control-expose-headers", "authorization"); // dice al client di leggere l'authorization        

                res.status(200).json({
                    token: token,
                });
            }
        })
    }
    else if (login.status == 200) {
        res.status(409).json({
            msg: "User already exists, please Login"
        });
    }
    else if (login.status == 500) {
        res.status(login.status).json({
            msg: login.loginInfo
        });
    }

});

app.post("/api/decodeToken", async (req, res) => {

    let { token } = req.body;

    try {
        const decoded = jwt.verify(token, privateKey, { algorithms: ["HS256"] });

        res.status(200).json({
            data: decoded  
        });

    }
    catch (err: any) {

        res.status(401).json({
            msg: "Error in the token's verification"
        });
    }
});


app.delete("/api/deleteUser", async (req, res) => {

    let { token } = req.body;
    let idU: number = req.body.idU;

    let tokenResponse: any = await decodeToken(token);

    if (tokenResponse.status == 200) {

        let queryDelUser = "DELETE FROM utenti WHERE idU = ?"
        let paramsUtenti = [idU];

        db.query(queryDelUser, paramsUtenti, (err, results) => {

            if (err) {
                console.log(err);
                res.status(500).json({
                    msg: "An error occured during the delete"
                });
            }
            else {

                res.status(200).json({
                    msg: "Delete succesfull"
                });

            }
        });

    }
    else {
        res.status(token.status).json({
            msg: token.msg
        });
    }
});

app.patch("/api/updateUser", async (req, res) => {

    console.log("[/api/updateUser] Richiesta ricevuta:", req.body);

    let { token, usr, pwd, img } = req.body;
    let idU: number = req.body.idU;

    let tokenResponse: any = await decodeToken(token);

    console.log("[/api/updateUser] Risposta decodeToken:", tokenResponse);

    if (tokenResponse.status == 200) {

        let queryUpUser;
        let paramsUpdate;

        if(pwd.trim() != "")
        {
            let hashPwd = md5(pwd);
            console.log("[/api/updateUser] Password aggiornata, hash:", hashPwd);

            queryUpUser = "UPDATE utenti SET Nickname = ?, Img = ?, Password = ? WHERE idU = ?";
            paramsUpdate = [usr, img, hashPwd, idU];
        }
        else
        {
            console.log("[/api/updateUser] Password non aggiornata");
            queryUpUser = "UPDATE utenti SET Nickname = ?, Img = ? WHERE idU = ?";
            paramsUpdate = [usr, img, idU];
        }

        console.log("[/api/updateUser] Query:", queryUpUser);
        console.log("[/api/updateUser] Params:", paramsUpdate);

        db.query(queryUpUser, paramsUpdate, (err, results) => {

            if (err) {
                console.log("[/api/updateUser] Errore DB:", err);
                res.status(500).json({
                    msg: "An error occured during the update"
                });
            }
            else {
                console.log("[/api/updateUser] Update riuscito:", results);
                res.status(200).json({
                    msg: "Update succesfull"
                });

            }
        });

    }
    else {
        console.log("[/api/updateUser] Token non valido:", tokenResponse);
        res.status(token.status).json({
            msg: token.msg
        });
    }
});

app.post("/api/getProfile", async (req, res) => {
    let { token } = req.body;
    let tokenResponse: any = await decodeToken(token);

    if (tokenResponse.status === 200) {
        let id = tokenResponse.data.id;
        let query = "SELECT idU, Nickname, Email, Img FROM utenti WHERE idU = ?";
        let params = [id];

        db.query(query, params, (err, results) => {
            if (err) {
                console.error("DB error:", err);
                return res.status(500).json({
                    msg: "An error occurred while fetching profile"
                });
            }

            const rows = results as any[];
            if (rows.length === 0) {
                return res.status(404).json({
                    msg: "User not found"
                });
            }

            res.status(200).json({
                data: rows[0]  // single user profile object
            });
        });
    } else {
        res.status(tokenResponse.status).json({
            msg: tokenResponse.msg
        });
    }
});



/* -- ENDPOINTS COLORI -- */

app.post("/api/savePalette", async (req, res) => {

    try {

        console.log(req.body);

        let { paletteName, paletteRGB, paletteHEX } = req.body;

        let paletteHEXArray = paletteHEX.trim().split(' ');

        let paletteRGBArray = paletteRGB.trim().split(' ');
        // let paletteName = req.body.paletteName;

        let idP = await getNewPaletteID();

        if (idP == null) {
            res.status(500);
            res.end();
        }
        else {

            const queryInsertPalette = "INSERT INTO palettes (idP, NomeP) VALUES (?, ?)";
            const paramsInsertPalette = [idP, paletteName];
            let insertedPalette = await insertPalette(queryInsertPalette, paramsInsertPalette);

            if (insertedPalette) {
                let queryInsertColors = "INSERT INTO `colori` (`idP`, `cRGB`, `cHEX`) VALUES ";
                let placeholders = [];
                let colorValues: any = [];

                for (let i = 0; i < paletteHEXArray.length; i++) {
                    placeholders.push("(?, ?, ?)");
                    colorValues.push(idP, paletteRGBArray[i], paletteHEXArray[i]);
                }

                queryInsertColors += placeholders.join(", ") + ";";

                let insertedColors = await insertColors(queryInsertColors, colorValues);

                if (insertedColors)
                    res.status(200).json({ IdP: idP });
                else
                    throw new Error();
            }
            else
                throw new Error();

        }

    } catch (err) {
        console.error("Errore nel salvataggio:", err);
        res.status(500);
        res.json({ msg: "Errore nel salvataggio" });
    }

});

app.post("/api/saveColor", async (req, res) => {

    let { colorName, mainColorHEX, mainColorRGB, img, idUser, idPalette } = req.body;

    let queryInsertImg = "INSERT INTO immagini(`Img`, `cRGB`, `cHEX`, `nomeC`, `idP`, `idU`) VALUES (?, ?, ?, ?, ?, ?)";
    let paramsInsertImg = [img, mainColorRGB, mainColorHEX, colorName, idPalette, idUser];

    db.query(queryInsertImg, paramsInsertImg, (err, results) => {

        if (err) {
            console.log(err);
            res.status(500);
        }
        else
            res.status(200);

        res.json({ msg: "Errore nel salvataggio" });
    });

});

app.post("/api/getImages", async (req, res) => {

    let { token } = req.body;
    let tokenResponse: any = await decodeToken(token);

    if (tokenResponse.status == 200) {

        let id = tokenResponse.data.id
        let query = "SELECT immagini.idI, immagini.nomeC, immagini.Img, immagini.cRGB, immagini.cHEX, immagini.idP FROM immagini WHERE immagini.idU = ?";
        let params = [id];

        db.query(query, params, (err, results) => {

            if (err) {
                console.log(err);
                res.status(500).json({
                    msg: "An error occured while getting informations"
                });
            }
            else {
                res.status(200).json({
                    data: results // è un array di oggetti
                });
            }

        });
    }
    else {
        res.status(token.status).json({
            msg: token.msg
        });
    }

});



app.post("/api/getPalette", async (req, res) => {

    let { token, idP } = req.body;
    let tokenResponse: any = await decodeToken(token);

    if (tokenResponse.status == 200) {

        let query = "SELECT palettes.NomeP, colori.cRGB, colori.cHEX FROM palettes INNER JOIN colori ON palettes.idP = colori.idP WHERE palettes.idP = ?";
        let params = [idP];

        db.query(query, params, (err, results) => {

            if (err) {
                console.log(err);
                res.status(500).json({
                    msg: "An error occured while getting informations"
                });
            }
            else {
                res.status(200).json({
                    data: results // è un array di oggetti
                });
            }

        });
    }
    else {
        res.status(token.status).json({
            msg: token.msg
        });
    }

});

app.patch("/api/updateColorPalette", async (req, res) => {

    let { colore, palette, token } = req.body;
    let idI: number = req.body.idI;
    let idP: number = req.body.idP;

    let tokenResponse: any = await decodeToken(token);

    if (tokenResponse.status == 200) {

        let queryUpColor = "UPDATE immagini SET nomeC = ? WHERE idI = ?";
        let paramsColor = [colore, idI];

        let queryUpPalette = "UPDATE palettes SET NomeP = ? WHERE idP = ?";
        let paramsPalette = [palette, idP];

        db.query(queryUpColor, paramsColor, (err, results) => {

            if (err) {
                console.log(err);
                res.status(500).json({
                    msg: "An error occured during the update"
                });
            }
            else {

                db.query(queryUpPalette, paramsPalette, (err, results) => {

                    if (err) {
                        console.log(err);
                        res.status(500).json({
                            msg: "An error occured during the update"
                        });
                    }
                    else {
                        res.status(200).json({
                            msg: "Update succesfull"
                        });
                    }
                });

            }
        });

    }
    else {
        res.status(token.status).json({
            msg: token.msg
        });
    }
});

app.delete("/api/deleteColorPalette", async (req, res) => {

    let { token } = req.body;
    let idI: number = req.body.idI;
    let idP: number = req.body.idP;

    let tokenResponse: any = await decodeToken(token);

    if (tokenResponse.status == 200) {

        let queryDelColor = "DELETE FROM immagini WHERE idI = ?";
        let paramsColor = [idI];

        let queryDelColors = "DELETE FROM colori WHERE idP = ?";
        let paramsColors = [idP];

        let queryDelPalette = "DELETE FROM palettes WHERE idP = ?";
        let paramsPalette = [idP];


        db.query(queryDelColor, paramsColor, (err, results) => {

            if (err) {
                console.log(err);
                res.status(500).json({
                    msg: "An error occured during the delete"
                });
            }
            else {

                db.query(queryDelColors, paramsColors, (err, results) => {

                    if (err) {
                        console.log(err);
                        res.status(500).json({
                            msg: "An error occured during the update"
                        });
                    }
                    else {

                        db.query(queryDelPalette, paramsPalette, (err, results) => {

                            if (err) {
                                console.log(err);
                                res.status(500).json({
                                    msg: "An error occured during the update"
                                });
                            }
                            else {

                                res.status(200).json({
                                    msg: "Update succesfull"
                                });

                            }
                        });
                    }
                })
            }
        });
    }
    else {
        res.status(token.status).json({
            msg: token.msg
        });
    }
});

/* ENDPOINT RECENSIONI */

app.post("/api/sendReview", async (req, res) => {

    let { stars, id, text, token } = req.body;

    let tokenResponse: any = await decodeToken(token);

    if (tokenResponse.status == 200) {

        let query = "INSERT INTO recensioni (idU, Valutazione, Descr) VALUES (?, ?, ?);";
        let params = [id, stars, text];

        db.query(query, params, (err, results) => {

            if (err) {
                console.log(err);
                res.status(500).send("Internal server error");
            }
            else {
                res.status(200).send("Review sent correctly");
            }

        })
    }
    else {
        res.status(token.status).json({
            msg: token.msg
        });
    }
});

app.get("/api/getAllReviews", async (req, res) => {

    let query = "SELECT recensioni.Valutazione, recensioni.Descr, recensioni.Data, utenti.Img, utenti.Nickname " +
        "FROM recensioni INNER JOIN utenti ON recensioni.idU = utenti.idU; ";

    db.query(query, (err, results) => {

        if (err) {
            console.log(err);
            res.status(500).send("Internal server error");
        }
        else {
            res.status(200).send({
                data: results
            });
        }

    })
});

app.post("/api/getUserReviews", async (req, res) => {

    let { token, idU } = req.body;

    let tokenResponse: any = await decodeToken(token);

    if (tokenResponse.status == 200) {

        let query = "SELECT * FROM recensioni WHERE idU = ?";
        let params = [idU];

        db.query(query, params, (err, results) => {

            if (err) {
                console.log(err);
                res.status(500).send("Internal server error");
            }
            else {
                res.status(200).send({
                    data: results
                });
            }

        })
    }
    else {
        res.status(token.status).json({
            msg: token.msg
        });
    }

})

/* -------------  OTHER FUNCTIONS ------------------ */

function UserExists(mail: string, pwd: string, query: string): Promise<any> {

    let rows: any;
    let params: string[];

    if (pwd.trim() != "")
        params = [mail, pwd];
    else
        params = [mail];

    return new Promise((resolve, reject) => {

        db.query(query, params, (err, results) => {

            console.log(query + " " + params);

            rows = results as any[];
            console.log(rows);

            if (err) {
                console.error("Errore nella query:", err);
                return resolve({ "loginInfo": "Server error, please try again", "status": 500 });
            }
            else {
                if (rows.length > 0)
                    return resolve({ "loginInfo": results, "status": 200 });
                else
                    return resolve({ "loginInfo": "User not found, wrong credentials", "status": 404 });
            }
        });
    });
}

function insertColors(query: string, params: any) {


    console.log("query: ", query);
    console.log("params: ", params);

    return new Promise((resolve, reject) => {

        db.query(query, params, (err, results) => {

            if (err) {
                console.log(err);
                return resolve(false);
            }
            else
                return resolve(true);
        });
    });
}


function insertPalette(query: string, params: any): Promise<boolean> {

    return new Promise((resolve, reject) => {

        db.query(query, params, (err, results) => {

            if (err)
                return resolve(false);
            else
                return resolve(true);
        });
    });
}


function getNewPaletteID(): Promise<number | null> {

    let query = "SELECT MAX(idP) as 'lastID' FROM palettes";
    let newID: number;

    return new Promise((resolve, reject) => {

        db.query(query, (err, results) => {

            if (err)
                return resolve(null);

            let queryRes = results as any[];
            let lastID: any = queryRes[0].lastID;


            if (lastID == null)
                newID = 1;
            else
                newID = lastID + 1;

            return resolve(newID);
        });
    });
}

// creazione token JWT
function createToken(data: any) {

    let now = Math.floor(new Date().getTime() / 1000); // data
    let payload = {

        "id": data.idU,
        "mail": data.Email,
        "usrName": data.Nickname,
        "img": data.Img,
        "iat": now,
        "exp": now + DURATA_TOKEN, // scadenza del token (15 minuti)
    };

    let token = jwt.sign(payload, privateKey, { algorithm: "HS256" });

    return token;
}

function decodeToken(token: any) {

    try {

        const decoded = jwt.verify(token, privateKey, { algorithms: ["HS256"] });

        return {
            status: 200,
            data: decoded
        };

    }
    catch (err: any) {


        return {
            status: 401,
            msg: "Error in token's verification"
        }
    }
}

function md5(input: string): string {
  return createHash('md5').update(input).digest('hex');
}

/* -------------------------------- */