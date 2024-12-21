const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { generateAccessToken, generateRefreshToken } = require('../utils/tokens');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { message: 'Too many login attempts, please try again later' }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email, password });
    await user.save();
    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ user: { id: user._id, username, email, isAdmin: user.isAdmin }, token });
  } catch (error) {
    res.status(400).json({ message: 'Registration failed', error: error.message });
  }
});

// Login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(423).json({ 
        message: 'Account is temporarily locked. Try again later.' 
      });
    }

    if (!(await user.comparePassword(password))) {
      user.loginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }
      
      await user.save();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = null;
    
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email,
        isAdmin: user.isAdmin
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(400).json({ message: 'Login failed', error: error.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

// Refresh token
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed' });
  }
});

module.exports = router;
