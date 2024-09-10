const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static('public'));

const ACCESS_TOKEN_SECRET = 'your_access_token_secret';
const REFRESH_TOKEN_SECRET = 'your_refresh_token_secret';

const users = [
  { id: 1, username: 'user1', password: 'password1' },
  { id: 2, username: 'user2', password: 'password2' }
];

function generateAccessToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, ACCESS_TOKEN_SECRET, { expiresIn: '1m' });
}

function generateRefreshToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'strict', maxAge: 60 * 1000 }); // 1 minute
    res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
    res.json({ message: 'Login successful', username: user.username });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

app.post('/refresh-token', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token not found' });

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid refresh token' });

    const accessToken = generateAccessToken({ id: user.id, username: user.username });
    res.cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'strict', maxAge: s60 * 1000 }); // 1 minute
    res.json({ message: 'Token refreshed' });
  });
});

app.get('/protected', authenticateToken, (req, res) => {
  res.render('protected', { username: req.user.username });
});

app.post('/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
});

function authenticateToken(req, res, next) {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json({ message: 'Access token not found' });

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid access token' });
    req.user = user;
    next();
  });
}

app.listen(3000, () => console.log('Server running on http://localhost:3000'));