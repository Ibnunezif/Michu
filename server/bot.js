import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cookieParser from 'cookie-parser'; 

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const port = 5000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "michu",
    password: "12345678",
    port: 5432,
});
db.connect();

const app = express();
app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true, 
}));
app.use(cookieParser());
app.use(express.json());

let chatHistory = [];

app.post('/', async (req, res) => {
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

app.listen(port, () => {
    console.log(`Running on http://localhost:${port}`);
});