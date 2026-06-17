
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');
const { authLimiter } = require('../middlewares/rateLimiter');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  refreshTokenValidator,
  handleValidationErrors,
} = require('../validators/authValidators');

// POST /api/auth/register
router.post(
  '/register',
  authLimiter,
  registerValidator,
  handleValidationErrors,
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  loginValidator,
  handleValidationErrors,
  authController.login
);

// POST /api/auth/logout  (no auth required — client just sends its refresh token)
router.post('/logout', authController.logout);

// POST /api/auth/refresh-token
router.post(
  '/refresh-token',
  refreshTokenValidator,
  handleValidationErrors,
  authController.refreshToken
);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  authLimiter,
  forgotPasswordValidator,
  handleValidationErrors,
  authController.forgotPassword
);

// POST /api/auth/reset-password/:token
router.post(
  '/reset-password/:token',
  resetPasswordValidator,
  handleValidationErrors,
  authController.resetPassword
);

// GET /api/auth/me  — protected
router.get('/me', authenticate, authController.getMe);

module.exports = router;
