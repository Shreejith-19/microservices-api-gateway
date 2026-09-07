import path from 'path';
import { fileURLToPath } from 'url';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve path to proto/notification.proto located at workspace root
const PROTO_PATH = path.resolve(__dirname, '../../../proto/notification.proto');

// Load protobuf definitions
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const notificationProto = grpc.loadPackageDefinition(packageDefinition).notification;

// Configurable target address from environment variable (default: localhost:50053)
const NOTIFICATION_GRPC_URL = process.env.NOTIFICATION_GRPC_URL || 'localhost:50053';

// Initialize the NotificationService gRPC Client
const client = new notificationProto.NotificationService(
  NOTIFICATION_GRPC_URL,
  grpc.credentials.createInsecure()
);

/**
 * Reusable helper to send an email notification via gRPC
 * @param {Object} payload - { recipient, subject, message }
 * @returns {Promise<Object>} gRPC response { success, message }
 */
export const sendEmailNotification = (payload) => {
  return new Promise((resolve, reject) => {
    client.SendEmail(payload, (error, response) => {
      if (error) {
        console.error(`[gRPC Client Error] NotificationService.SendEmail failed:`, error);
        return reject(error);
      }
      resolve(response);
    });
  });
};

export default client;
