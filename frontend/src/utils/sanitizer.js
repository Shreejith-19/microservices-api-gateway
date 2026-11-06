/**
 * Sanitization utility to prevent logging or exposing sensitive data
 * such as passwords, credentials, and full authorization secrets.
 */

const SENSITIVE_KEYS = [
  'password',
  'confirmPassword',
  'secret',
  'currentPassword',
  'newPassword',
  'apiKey',
  'jwtSecret',
];

/**
 * Deep clones and redacts sensitive field values in payloads
 * @param {any} data - Request or response payload
 * @returns {any} Sanitized clone of the payload
 */
export const sanitizePayload = (data) => {
  if (!data) return data;

  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;

    if (typeof parsed !== 'object' || parsed === null) {
      return parsed;
    }

    if (Array.isArray(parsed)) {
      return parsed.map((item) => sanitizePayload(item));
    }

    const sanitized = {};
    for (const [key, val] of Object.entries(parsed)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = SENSITIVE_KEYS.some((sensitiveKey) =>
        lowerKey.includes(sensitiveKey.toLowerCase())
      );

      if (isSensitive) {
        sanitized[key] = '******** [REDACTED]';
      } else if (typeof val === 'object' && val !== null) {
        sanitized[key] = sanitizePayload(val);
      } else {
        sanitized[key] = val;
      }
    }
    return sanitized;
  } catch {
    // If string parsing fails, return as-is
    return data;
  }
};

/**
 * Truncates and sanitizes authorization tokens in headers
 * @param {Object} headers - Axios request or response headers
 * @returns {Object} Sanitized headers object
 */
export const sanitizeHeaders = (headers = {}) => {
  if (!headers || typeof headers !== 'object') return {};

  const clean = {};
  for (const [key, val] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();

    if (lowerKey === 'authorization' && typeof val === 'string') {
      clean[key] = val.startsWith('Bearer ')
        ? `Bearer ${val.slice(7, 18)}... [REDACTED]`
        : 'Bearer [REDACTED]';
    } else if (
      lowerKey === 'cookie' ||
      lowerKey === 'set-cookie' ||
      lowerKey === 'proxy-authorization'
    ) {
      clean[key] = '[REDACTED]';
    } else {
      clean[key] = val;
    }
  }
  return clean;
};

