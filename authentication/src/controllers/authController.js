// src/controllers/authController.js
// ---------------------------------------------------------------------------
// HTTP layer for auth endpoints.
//
// Controllers are intentionally thin:
//   1. Extract data from req
//   2. Call the service
//   3. Format and send the response
//
// All business logic lives in src/services/authService.js.
// All errors are caught by catchAsync and forwarded to errorHandler.js.
// ---------------------------------------------------------------------------

const authService = require('../services/authService');
const userRepo = require('../repositories/userRepository');
const catchAsync = require('../utils/catchAsync');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.register({
    name,
    email,
    password,
  });

  res.status(201).json({
    status: 'success',
    message: 'Account created successfully.',
    data: { user, accessToken, refreshToken },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await authService.login({ email, password });

  res.status(200).json({
    status: 'success',
    message: 'Logged in successfully.',
    data: { user, accessToken, refreshToken },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/logout
// ─────────────────────────────────────────────────────────────────────────────
const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.',
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/refresh-token
// ─────────────────────────────────────────────────────────────────────────────
const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken: token } = req.body;

  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(token);

  res.status(200).json({
    status: 'success',
    message: 'Tokens refreshed successfully.',
    data: { accessToken, refreshToken: newRefreshToken },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  // Always call the service (anti-enumeration: same response whether or not
  // the email exists — the service handles this internally)
  await authService.forgotPassword(email);

  res.status(200).json({
    status: 'success',
    // Deliberately vague to prevent account enumeration
    message: 'If an account exists with that email, a reset link has been sent.',
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password/:token
// ─────────────────────────────────────────────────────────────────────────────
const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  await authService.resetPassword(token, password);

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully. Please log in with your new password.',
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me  (protected — requires valid access token)
// ─────────────────────────────────────────────────────────────────────────────
const getMe = catchAsync(async (req, res) => {
  // req.user is set by the authenticate middleware
  const user = await userRepo.findUserById(req.user.id);

  if (!user) {
    return res.status(404).json({ status: 'fail', message: 'User not found.' });
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

module.exports = { register, login, logout, refreshToken, forgotPassword, resetPassword, getMe };
