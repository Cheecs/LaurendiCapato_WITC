import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mysql from 'mysql2';

//Config the env from the ENVIRONMENT


// DEBUG THE ENVS
dotenv.config();
const PORT = process.env.PORT || 4000;
const PWD = process.env.passwd ;

let app = express();
app.use(express.json());

const db = mysql.createConnection({
    host: 'srv-captain--db-witc-db',
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

app.get('/api/users', (req, res) => {

    let query = "SELECT * FROM utenti WHERE Nickname = ?";

    db.query(query, ["test"], (err, results) => {

        if(err)
            res.send(err);
        else    
            res.send(results);
    });

})

app.post('/api/login', (req, res) => {

    let { mail, pwd } = req.body;
    let login = UserExists(mail, pwd);

    if(login.status == 200)
    {
        res.status(login.status).send(`Logged In: \\n ${login.loginInfo}`)
    }
    else if(login.status == 404)
    {
            res.status(login.status).send(`${login.loginInfo}`);
    }
    else if(login.status == 500)
    {
        res.status(login.status).send(`${login.loginInfo}`);
    }

});

function UserExists(mail:string, pwd:string):any{

    let query = "SELECT * FROM utenti WHERE Email = ? AND Password = ?"

    db.query(query, [mail, pwd], (err, results) => {

        if (err) 
            return {"loginInfo": "User not found, wrong credentials", "status":404};
        
        if(results)
            return {"loginInfo": results, "status":200};
    });

    return {"loginInfo": "An error occured during the login, please try again", "status":500};
}