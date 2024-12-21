const crypto = require('crypto');

const generateSecret = () => crypto.randomBytes(64).toString('hex');

console.log(`JWT_SECRET=${generateSecret()}`);
console.log(`REFRESH_TOKEN_SECRET=${generateSecret()}`);
