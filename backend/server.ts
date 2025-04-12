import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2';
import nodemailer from 'nodemailer'

//Config the env from the ENVIRONMENT


// DEBUG THE ENVS
dotenv.config();
const PORT = process.env.PORT || 4000;
const PWD = process.env.DB_passwd ;
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

/* ENDPOINT UTENTI */ 

app.post('/api/login', async (req, res) => {

    let { mail, pwd } = req.body;
    let login = await UserExists(mail, pwd);

    if(login.status == 200)
    {
        res.status(login.status).json({
            data: login.loginInfo[0]
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

app.post('/api/signup', async (req, res) => {

    let { mail, pwd, usrName } = req.body;
    let login = await UserExists(mail, pwd);
    let query = "INSERT INTO utenti(Nickname, Email, Password, Img) VALUES(?, ?, ?, null)";
    
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
                    <div style="border:1px solid lightgray; padding:10; border-radius:15px;">
                        <p style="margin-top:-1;">Team di WITC</p>
                    <img style="height:100; width: 100; margin-top: -20; margin-bottom: -15;" src="https://witc.connectify.it/img/Logo_WITC_NoBG.png" />
                    </div>
                    </div>`, // HTML body
                }, (emailErr, info) => {

                    res.status(200).json({
                        data: results,
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


function UserExists(mail:string, pwd:string):Promise<any>{

    let rows:any;

    return new Promise((resolve, reject) => {

        let query = "SELECT * FROM utenti WHERE Email = ? AND Password = ?";

        db.query(query, [mail, pwd], (err, results) => {

            rows = results as any[];
            console.log(rows);
            if (err)
                return resolve({ "loginInfo": "Server error, please try again", "status": 500 });

            if (rows.length > 0) {

                return resolve({ "loginInfo": results, "status": 200 });

            } else {
                return resolve({ "loginInfo": "User not found, wrong credentials", "status": 404 });
            }
        });
    });
}