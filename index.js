const express = require('express');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const CHITKARA_EMAIL = "parth1172.be23@chitkara.edu.in"; 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const isPrime = (num) => {
    if (num <= 1) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
};

const getFibonacci = (n) => {
    let series = [0, 1];
    for (let i = 2; i < n; i++) {
        series.push(series[i - 1] + series[i - 2]);
    }
    return series.slice(0, n);
};

const getGCD = (a, b) => b === 0 ? a : getGCD(b, a % b);
const getLCM = (a, b) => (a * b) / getGCD(a, b);


app.get('/health', (req, res) => {
    res.status(200).json({
        is_success: true,
        official_email: CHITKARA_EMAIL
    });
});


app.post('/bfhl', async (req, res) => {
    try {
        const body = req.body;
        const keys = Object.keys(body);

        if (keys.length !== 1) {
            return res.status(400).json({ is_success: false, message: "Request must contain exactly one valid key." });
        }

        const key = keys[0];
        const value = body[key];
        let resultData;

        switch (key) {
            case 'fibonacci':
                if (typeof value !== 'number') throw new Error("Integer required");
                resultData = getFibonacci(value);
                break;

            case 'prime':
                if (!Array.isArray(value)) throw new Error("Integer array required");
                resultData = value.filter(num => isPrime(num));
                break;

            case 'lcm':
                if (!Array.isArray(value)) throw new Error("Integer array required");
                resultData = value.reduce((acc, curr) => getLCM(acc, curr));
                break;

            case 'hcf':
                if (!Array.isArray(value)) throw new Error("Integer array required");
                resultData = value.reduce((acc, curr) => getGCD(acc, curr));
                break;

            case 'AI':
                const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
                const prompt = `${value}. Respond with exactly one word.`;
                const result = await model.generateContent(prompt);
                resultData = result.response.text().trim().replace(/[^\w]/g, '');
                break;

            default:
                return res.status(400).json({ is_success: false, message: "Invalid key provided." });
        }

        res.status(200).json({
            is_success: true,
            official_email: CHITKARA_EMAIL,
            data: resultData
        });

    } catch (error) {
        res.status(500).json({
            is_success: false,
            official_email: CHITKARA_EMAIL,
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));