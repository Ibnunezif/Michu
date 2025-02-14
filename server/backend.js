import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const port = 5000; // server port

const db = new pg.Client({
    user: process.env.USER,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT,
});
db.connect();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

let chatHistory = [];

app.get('/', (req, res) => {
    res.redirect('/login');
});

// User registration route
app.get('/register', (req, res) => {
    res.render('register'); 
});
// User login route
app.get('/login', (req, res) => {
    res.render('login'); 
});

// Homepage route
app.get('/homepage', async (req, res) => {
    if (!req.cookies.email) {
        return res.redirect('/login'); 
    }
    try {
        const result = await db.query("SELECT * FROM chat where email = $1", [req.cookies.email]); 
        res.render('homepage', { chats: result.rows }); 
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Internal Server Error');
    }
});




// Chat route
app.post('/chat', async (req, res) => {
    try {
        const email = req.cookies.email;
        const prompt = req.body.prompt;

        chatHistory.push({ role: 'user', parts: [{ text: prompt }] });

        const fullPrompt = chatHistory.map(entry => 
            `${entry.role === 'user' ? 'User' : 'Bot'}: ${entry.parts[0].text}`
        ).join('\n');
        
        const response = await model.startChat(chatHistory).sendMessageStream(fullPrompt);
        let botReply = '';

        for await (const chunk of response.stream) {
            botReply += chunk.text();
        }

        chatHistory.push({ role: 'model', parts: [{ text: botReply }] });

        res.status(200).send({
            bot: botReply
        });

        await db.query(
            "INSERT INTO chat (email, request, response) VALUES ($1, $2, $3)", 
            [email, prompt, botReply]
        );

    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: error.message
        });
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('email');
    res.redirect('/login');
});


app.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        if (checkResult.rows.length > 0) {
            res.redirect('/login');
        } else {
            const hashedPassword=await bcrypt.hash(password,10);
            await db.query(
                "INSERT INTO users (firstName, lastName, email, password) VALUES ($1, $2, $3, $4)", 
                [firstName, lastName, email, hashedPassword]
            );
            res.cookie('email', email, {
                maxAge: 900000,
                httpOnly: true, 
                secure: true, 
                sameSite: 'None' 
              }); 

            res.redirect("/login");
        }
    } catch (err) {
        console.log(err);
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length > 0) {

            const user = result.rows[0];
            const storedPassword = user.password;
            const isMatch = await bcrypt.compare(password, storedPassword);

            if (isMatch) {

                res.cookie('email', email, {
                      maxAge: 900000,
                      httpOnly: true, 
                      secure: true, 
                      sameSite: 'None' 
                    }); 

                res.redirect("/homepage");
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

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});