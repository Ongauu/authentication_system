

const AppError = require('../utils/AppError');


const handlePrismaError = (err) => {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation
      return new AppError(
        `A record with that ${err.meta?.target?.join(', ')} already exists.`,
        409
      );
    case 'P2025':
      // Record not found
      return new AppError('Record not found.', 404);
    default:
      return new AppError('A database error occurred.', 500);
  }
};


const handleJWTError = () => new AppError('Invalid token — please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Token has expired — please log in again.', 401);


const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  // Translate known third-party error types into AppErrors
  if (err.constructor?.name === 'PrismaClientKnownRequestError') {
    error = handlePrismaError(err);
  } else if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  } else if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  
  if (process.env.NODE_ENV === 'development') {
    console.error(' Error:', err);
  } else if (error.statusCode === 500) {
    console.error('Unexpected error:', err);
  }

  // Operational errors — safe to expose to client
  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }

  // Programming / unknown errors — generic message only
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong. Please try again later.',
  });
};

module.exports = errorHandler;
