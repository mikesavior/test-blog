const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};
