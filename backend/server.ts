import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2';

//Config the env from the ENVIRONMENT


// DEBUG THE ENVS
dotenv.config();
const PORT = process.env.PORT || 4000;
const PWD = process.env.DB_passwd ;
const SERVER = process.env.DB_host;

let app = express();
app.use(express.json());

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
                res.status(200).json({
                    data: results
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