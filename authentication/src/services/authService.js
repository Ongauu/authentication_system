
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const AppError = require('../utils/AppError');
const jwtUtil = require('../utils/jwt');
const { sendPasswordResetEmail } = require('../utils/email');
const userRepo = require('../repositories/userRepository');
const tokenRepo = require('../repositories/tokenRepository');

const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

const _issueTokenPair = async (user) => {
  
  const accessToken = jwtUtil.generateAccessToken({ id: user.id, email: user.email });
  const refreshToken = jwtUtil.generateRefreshToken({ id: user.id });

  
  const decoded = jwtUtil.verifyRefreshToken(refreshToken);
  const expiresAt = new Date(decoded.exp * 1000); // `exp` is in seconds

  
  await tokenRepo.createRefreshToken({ token: refreshToken, userId: user.id, expiresAt });

  return { accessToken, refreshToken };
};

const register = async ({ name, email, password }) => {
  
  const existing = await userRepo.findUserByEmail(email);
  if (existing) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await userRepo.createUser({ name, email, password: hashedPassword });

  // Issue tokens immediately (auto-login after registration)
  const { accessToken, refreshToken } = await _issueTokenPair(user);

  return { user, accessToken, refreshToken };
};


const login = async ({ email, password }) => {
  // 1. Look up user
  const user = await userRepo.findUserByEmail(email);

  const DUMMY_HASH = '$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
  const isMatch = user
    ? await bcrypt.compare(password, user.password)
    : await bcrypt.compare(password, DUMMY_HASH);

  if (!user || !isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  // 3. Issue tokens
  const { accessToken, refreshToken } = await _issueTokenPair(user);

  // 4. Strip password before returning
  const { password: _p, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
};


const logout = async (refreshToken) => {
  await tokenRepo.deleteRefreshToken(refreshToken);
};


const refreshTokens = async (token) => {
  // 1. Verify JWT signature and expiry
  let payload;
  try {
    payload = jwtUtil.verifyRefreshToken(token);
  } catch {
    throw new AppError('Invalid or expired refresh token.', 401);
  }

  // 2. Check the token exists in the DB (guards against re-use after logout)
  const stored = await tokenRepo.findRefreshToken(token);
  if (!stored) {
    throw new AppError('Refresh token not recognised — please log in again.', 401);
  }

  // 3. Check DB-level expiry (belt-and-suspenders)
  if (new Date() > stored.expiresAt) {
    await tokenRepo.deleteRefreshToken(token);
    throw new AppError('Refresh token expired — please log in again.', 401);
  }

  // 4. Rotate delete old, issue new
  await tokenRepo.deleteRefreshToken(token);
  const { accessToken, refreshToken: newRefreshToken } = await _issueTokenPair(stored.user);

  return { accessToken, refreshToken: newRefreshToken };
};


const forgotPassword = async (email) => {
  const user = await userRepo.findUserByEmail(email);

  // Do NOT reveal whether the account exists — silently return if not found
  if (!user) return;

  // 1. Generate a cryptographically secure random token (32 bytes = 256 bits)
  const rawToken = crypto.randomBytes(32).toString('hex'); // sent in the email URL

  // 2. Hash it before storing — if the DB leaks, attackers still can't use hashes
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // 3. Delete any previous unused reset tokens for this user (clean slate)
  await tokenRepo.deletePasswordResetTokensForUser(user.id);

  // 4. Persist the hashed token with expiry
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
  await tokenRepo.createPasswordResetToken({ tokenHash, userId: user.id, expiresAt });

  // 5. Build the reset link and send the email
  const resetLink = `${process.env.APP_URL}/reset-password/${rawToken}`;
  await sendPasswordResetEmail({
    to: user.email,
    name: user.name,
    resetLink,
    expiryMins: 15,
  });
};


const resetPassword = async (rawToken, newPassword) => {
  // 1. Hash the incoming token to compare with stored hash
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // 2. Look up the hashed token
  const record = await tokenRepo.findPasswordResetToken(tokenHash);
  if (!record) {
    throw new AppError('Invalid reset token.', 400);
  }

  // 3. Check one-time-use flag
  if (record.used) {
    throw new AppError('Token already used.', 400);
  }

  // 4. Check expiry
  if (new Date() > record.expiresAt) {
    throw new AppError('Reset token expired.', 400);
  }

  // 5. Hash new password and update user record
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await userRepo.updatePassword(record.userId, hashedPassword);

  // 6. Mark token as used so it cannot be replayed
  await tokenRepo.markPasswordResetTokenUsed(tokenHash);

  // 7. Invalidate all active sessions (security hygiene after password change)
  await tokenRepo.deleteAllRefreshTokensForUser(record.userId);
};


module.exports = { register, login, logout, refreshTokens, forgotPassword, resetPassword };
