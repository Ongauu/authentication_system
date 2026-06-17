

const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 5,               

  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    res.status(429).json({
      status: 'fail',
      message: 'Too many requests — please try again in 1 minute.',
    });
  },

  keyGenerator: (req) => req.ip,
});

module.exports = { authLimiter };
