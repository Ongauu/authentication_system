
const AppError = require('../utils/AppError');
const { verifyAccessToken } = require('../utils/jwt');

const authenticate = (req, res, next) => {
  // 1. Extract the Authorization header
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Access token is missing or malformed.', 401));
  }

  // 2. Isolate the token string
  const token = authHeader.split(' ')[1];

  // 3. Verify — verifyAccessToken throws for invalid/expired tokens
  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.id, email: decoded.email }; // attach to request
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Access token has expired.', 401));
    }
    return next(new AppError('Invalid access token.', 401));
  }
};

module.exports = authenticate;
