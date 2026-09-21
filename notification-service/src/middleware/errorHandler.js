// Centralized Error Handling Middleware for Notification Service
export const errorHandler = (err, req, res, next) => {
  // If response headers were already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message = err.message || 'Internal Server Error';

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
