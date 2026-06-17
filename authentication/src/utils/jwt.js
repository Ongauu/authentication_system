
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

const generateAccessToken = (payload) => {
  return jwt.sign(payload, jwtConfig.accessSecret, {
    expiresIn: jwtConfig.accessExpiresIn,
    issuer: 'auth-app',
    audience: 'auth-app-client',
  });
};


const generateRefreshToken = (payload) => {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
    issuer: 'auth-app',
    audience: 'auth-app-client',
  });
};


const verifyAccessToken = (token) => {
  return jwt.verify(token, jwtConfig.accessSecret, {
    issuer: 'auth-app',
    audience: 'auth-app-client',
  });
};


const verifyRefreshToken = (token) => {
  return jwt.verify(token, jwtConfig.refreshSecret, {
    issuer: 'auth-app',
    audience: 'auth-app-client',
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
