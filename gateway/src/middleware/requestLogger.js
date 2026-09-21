/**
 * Structured Request Logger Middleware for API Gateway
 * Captures timestamp, HTTP method, path, status code, response time, and client IP.
 */
export const requestLogger = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  const timestamp = new Date().toISOString();

  // Listen for the response finish event to record final status and duration
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    // Convert nanoseconds to milliseconds
    const durationMs = (Number(endTime - startTime) / 1e6).toFixed(2);

    const clientIp =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.ip ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const logData = {
      timestamp,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: `${durationMs}ms`,
      clientIp,
    };

    // Visual ANSI color codes for HTTP status codes
    const statusColor =
      res.statusCode >= 500
        ? '\x1b[31m' // Red (Server error)
        : res.statusCode >= 400
        ? '\x1b[33m' // Yellow (Client error)
        : res.statusCode >= 300
        ? '\x1b[36m' // Cyan (Redirect)
        : '\x1b[32m'; // Green (Success)
    const resetColor = '\x1b[0m';

    console.log(
      `[${logData.timestamp}] ${logData.method} ${logData.path} ${statusColor}${logData.statusCode}${resetColor} - ${logData.responseTime} (Client IP: ${logData.clientIp})`
    );
  });

  next();
};

export default requestLogger;
