// Centralized Error Handling Middleware for User Service
export const errorHandler = (err, req, res, next) => {
  // If response headers were already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Determine status code:
  // 1. Use err.statusCode if explicitly set
  // 2. Otherwise use res.statusCode if modified from 200
  // 3. Default to 500 (Internal Server Error)
  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    const duplicateField = Object.keys(err.keyValue || {})[0] || 'field';
    message = `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already exists.`;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors || {})
      .map((val) => val.message)
      .join(', ');
  }

  // Handle Mongoose CastError
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}: ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// 404 Route Not Found Middleware
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};
