 Auth System

A production-ready backend authentication API built with Node.js and Express.
Covers the full auth lifecycle registration, login, token refresh, logout,
and a secure forgot/reset password flow with one-time-use email tokens.

Tech Stack

Express: REST API framework
PostgreSQL + Prisma: database and ORM
JWT: access tokens (15 min) and refresh tokens (7 days) with rotation
bcrypt: password hashing
Nodemailer: password reset emails with HTML template
Helmet: security headers (CSP, XSS, Frameguard)
express-rate-limit: brute-force protection on auth endpoints
express-validator: input validation

## Features

- User registration and login
- JWT access + refresh token pair with token rotation on every refresh
- Secure forgot password flow — reset tokens are SHA-256 hashed before storage, one-time use, expire in 15 minutes
- Account enumeration protection on all sensitive endpoints
- Password strength enforcement
- Rate limiting (5 requests/min) on `/register`, `/login`, `/forgot-password`
- Centralised error handling — operational vs unexpected errors handled separately
- Clean layered architecture: controllers → services → repositories
