// middleware/rateLimits.js
const rateLimit = require('express-rate-limit');
const ExpressBrute = require('express-brute');

const store = new ExpressBrute.MemoryStore();

const authLimits = {
  register: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    message: { message: 'Too many accounts created. Try again later.' }
  }),

  passwordReset: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3,
    message: { message: 'Too many password reset attempts. Try again later.' }
  }),

  login: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { message: 'Too many login attempts. Try again later.' },
    standardHeaders: true,
    legacyHeaders: false
  }),

  bruteforce: new ExpressBrute(store, {
    freeRetries: 3,
    minWait: 5 * 60 * 1000,
    maxWait: 60 * 60 * 1000,
    lifetime: 24 * 60 * 60
  })
};

const adminLimits = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000000,
  message: { message: 'Too many admin requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { authLimits, adminLimits };