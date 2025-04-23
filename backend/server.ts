import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2';
import nodemailer from 'nodemailer'
import jwt from "jsonwebtoken";
import fs from "fs";

const privateKey = process.env.PRIVATE_KEY!;
const DURATA_TOKEN = 900; // secondi

// DEBUG THE ENVS
dotenv.config();

const PORT = process.env.PORT || 4000;
const PWD = process.env.DB_passwd;
const SERVER = process.env.DB_host;

let app = express();
app.use(express.json());

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

const db = mysql.createConnection({
    host: SERVER,
    user: 'root',
    password: PWD,  
    database: 'witc'
});

app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});

// Connetti al database
db.connect((err: mysql.QueryError | null) => {

    if (err) {
        console.error('Errore di connessione:', err);
        return;
    }

    console.log('Connesso a MySQL');
});

// test endpoint
app.get('/api', (req, res) => {
    res.send('API attiva!');
});

/* -- ENDPOINT UTENTI -- */ 

// Login
app.post('/api/login', async (req, res) => {

    let { mail, pwd } = req.body;
    let query = "SELECT * FROM utenti WHERE Email = ? AND Password = ?"
    let login = await UserExists(mail, pwd, query);
    
    if(login.status == 200)
    {
        let token = createToken(login.loginInfo[0]);

        res.setHeader("authorization", token);
        res.setHeader("access-control-expose-headers", "authorization"); // dice al client di leggere l'authorization        

        res.status(login.status).json({
            data: login.loginInfo[0],
            token: token
        });


    }
    else if(login.status == 404)
    {
            res.status(login.status).json({
                msg: login.loginInfo
            });
    }
    else if(login.status == 500)
    {
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
    
    if(login.status == 404)
    {
        db.query(query, [usrName, mail, pwd], (err, results) => {
            
            if(err)
            {
                res.status(500).json({
                    msg: "Server error, please try again"
                });
            }

            if(results)
            {
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

                    let token = createToken(results);

                    res.setHeader("authorization", token);
                    res.setHeader("access-control-expose-headers", "authorization"); // dice al client di leggere l'authorization        

                    res.status(200).json({
                        data: "token",
                    });
                });
            }
        })
    }
    else if(login.status == 200)
    {
        res.status(409).json({
            msg: "User already exists, please Login"
        });
    }
    else if(login.status == 500)
    {
        res.status(login.status).json({
            msg: login.loginInfo
        });
    }

});

/* ------------------------------- */

function UserExists(mail:string, pwd:string, query:string):Promise<any>{

    let rows:any;
    let params: string[];

    if(pwd.trim() != "")
        params = [mail, pwd];
    else
        params = [mail];

    return new Promise((resolve, reject) => {

        db.query(query, params, (err, results) => {

            rows = results as any[];
            console.log(rows);

            if (err)
                return resolve({ "loginInfo": "Server error, please try again", "status": 500 });
            else
            {
                if (rows.length > 0) 
                    return resolve({ "loginInfo": results, "status": 200 });
                else
                    return resolve({ "loginInfo": "User not found, wrong credentials", "status": 404 });
            }
        });
    });
}

/* FUNZIONI PER jwt */

function createToken(data:any){

    let now = Math.floor(new Date().getTime()/1000); // data
    let payload = {

        "_id": data.idU,
        "mail": data.Mail,
        "iat": now,
        "exp": now + DURATA_TOKEN, // scadenza del token (15 minuti)
    };

    // private key è nel server

    let token = jwt.sign(payload, privateKey, {algorithm:"RS256"});
    console.log(`Creato nuovo token: ${token}`);

    return token;
}


function controllaToken(req:any, res:any){

    if(!req.headers.authorization)
        res.send(403).send("Token mancante");
    else
    {
        // la verify controlla anche la scadenza 

        let token = req.headers.authorization;

        jwt.verify(token, privateKey, function(err:any, payload:any){
            
            if(err)
                res.status(403).send("Token non valido");
            else
            {
                let newToken =  createToken(payload);
                console.log("Payload", payload.username);

                res.setHeader("authorization", newToken);
                res.setHeader("access-control-expose-header", "authorization");

                req["payload"] = payload;
            }
        })
    }
}
