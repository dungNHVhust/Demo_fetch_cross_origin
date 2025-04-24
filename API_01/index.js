const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const path = require('path');

const SECRET_KEY = 'this_is_secret_key';

const app = express();

app.use(cookieParser());
app.use(express.json());

// CORS configuration - chấp nhận request từ domain ngrok của Main service
const corsOptions = {
    origin: 'https://399b-118-70-236-135.ngrok-free.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

app.use(cors(corsOptions));

// Thêm middleware xử lý CORS trước các routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://399b-118-70-236-135.ngrok-free.app');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

//Middleware check jwt token
const checkJWT = (req, res, next) => {
    console.log('Cookies received:', req.cookies);
    console.log('Headers:', req.headers);
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized - No token found' });
    }
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized - Invalid token' });
        }
        req.user = user;
        next();
    });
}

app.get('/api/v1/auth', checkJWT, (req, res) => {
    res.json({ message: 'Authenticated !!! Hello ' + req.user.username });
});

app.listen(3001, () => {
    console.log('[+] Server is running on port 3001 !!!');
});
