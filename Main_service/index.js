const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname,'public')));

const SECRET_KEY = "this_is_secret_key";

// Middleware to check JWT token
const authenticateToken = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.redirect('/');
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.redirect('/');
        }
        req.user = user;
        next();
    });
};

// [GET] / 
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// [GET] /dashboard 
app.get('/dashboard', authenticateToken, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// [POST] /login
app.post('/login', (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: 'Required username !!!' });
    }

    // Create JWT
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

    res.cookie('jwt', token, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        path: '/',
        maxAge: 3600000
    });

    res.json({ message: "Success!!!", redirect: "/dashboard" });
});

// [POST] /logout
app.post('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.json({ message: "Logged out successfully", redirect: "/" });
});

app.listen(3000, () => console.log("[+] Main service is running on port 3000 !!!"));