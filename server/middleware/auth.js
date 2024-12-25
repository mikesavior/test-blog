const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    console.log('[Auth] Checking authorization header');
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      console.warn('[Auth] No Authorization header present');
      return res.status(401).json({ message: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.warn('[Auth] Token not found in Authorization header');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('[Auth] Verifying token');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error('[Auth] JWT verification failed:', jwtError.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    console.log(`[Auth] Looking up user ID: ${decoded.id}`);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      console.warn(`[Auth] User not found for ID: ${decoded.id}`);
      return res.status(401).json({ message: 'User not found' });
    }

    console.log(`[Auth] Successfully authenticated user: ${user.username}`);
    req.user = {
      id: parseInt(user.id),
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin
    };
    next();
  } catch (error) {
    console.error('[Auth] Unexpected error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }
      next();
    });
  } catch (error) {
    res.status(403).json({ message: 'Admin access required' });
  }
};

module.exports = { auth, adminAuth };
