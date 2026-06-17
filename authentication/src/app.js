
require('dotenv').config();		

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], 
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    
    frameguard: { action: 'deny' },
    
    xssFilter: true,
    
    noSniff: true,
    
    hsts: process.env.NODE_ENV === 'production'
      ? { maxAge: 31536000, includeSubDomains: true }
      : false,
  })
);

app.use(
  cors({
    origin: process.env.NODE_ENV === 'produnction'? process.env.CORS_ORIGIN
      : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, 
  })
);

app.use(express.json({ limit: '10kb' }));         
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.get('/tester', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend-tester.html'));
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.use('/api/auth', authRoutes);


app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found.`, 404));
});


app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n Auth server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   API:    http://localhost:${PORT}/api/auth\n`);
});


process.on('unhandledRejection', (err) => {
  console.error('unhandled rejection:', err);
  process.exit(1);
});

module.exports = app; // exported for testing
