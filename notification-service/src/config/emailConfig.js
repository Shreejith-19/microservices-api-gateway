export const emailConfig = {
  provider: process.env.EMAIL_PROVIDER || 'mock',
  fromAddress: process.env.EMAIL_FROM || 'noreply@microservices-platform.com',
};
