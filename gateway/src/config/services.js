export const serviceConfig = {
  authServiceUrl: process.env.AUTH_SERVICE_URL || 'http://localhost:5001',
  userServiceUrl: process.env.USER_SERVICE_URL || 'http://localhost:5002',
  notificationServiceUrl:
    process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5003',
};
