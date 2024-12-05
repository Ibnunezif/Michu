import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import cookieParser from 'cookie-parser';
import pg from 'pg';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "michu",
    password: "12345678",
    port: 5432,
  });
  db.connect();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public'))); 
app.use(cookieParser());


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views')); 


app.get('/login', (req, res) => {
    res.render('login'); 
});

app.get('/register', (req, res) => {
    res.render('register'); 
});

app.post('/register', async (req, res) => {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    try {
        const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
          email,
        ]);
    
        if (checkResult.rows.length > 0) {
          res.render('login');
        } else {
          const result = await db.query(
            "INSERT INTO users (firstName,lastName,email, password) VALUES ($1, $2,$3,$4)", 
            [firstName, lastName, email,password]
          );
          res.render("homepage");
        }
      } catch (err) {
        console.log(err);
      }
    
});

app.post('/login', async (req,res)=>{
    const email = req.body.email;
    const password = req.body.password;
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedPassword = user.password;
  
        if (password === storedPassword) {
          res.cookie('email', email, { maxAge: 900000, httpOnly: true,secure: true,sameSite:'None' }); 
          res.render("homepage");
        } else {
          res.send('<script>alert("Incorrect Password, please try again."); window.location.href = "/login";</script>');
        }
      } else {
        res.send('<script>alert("There is no such account, please try again or register."); window.location.href = "/login";</script>');
      }
    } catch (err) {
      console.log(err);
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});