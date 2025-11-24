const { Prisma } = require('@prisma/client');

const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err);

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        const field = err.meta?.target?.[0] || 'field';
        return res.status(409).json({
          error: 'Duplicate entry',
          message: `${field} already exists`,
          code: err.code
        });

      case 'P2025':
        // Record not found
        return res.status(404).json({
          error: 'Record not found',
          message: 'The requested resource does not exist',
          code: err.code
        });

      case 'P2003':
        // Foreign key constraint violation
        return res.status(400).json({
          error: 'Invalid reference',
          message: 'Referenced record does not exist',
          code: err.code
        });

      default:
        return res.status(400).json({
          error: 'Database error',
          message: err.message,
          code: err.code
        });
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message,
      details: err.details
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'Authentication token is invalid'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: 'Authentication token has expired'
    });
  }

  // File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      message: `File size exceeds the limit of ${process.env.MAX_FILE_SIZE} bytes`
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    error: 'Server error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = {
  errorHandler
};