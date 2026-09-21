import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';
import { emailService } from '../services/emailService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Candidate locations for proto/notification.proto (container, local service, or workspace root)
const candidateProtoPaths = [
  process.env.PROTO_PATH,
  path.resolve(__dirname, '../../proto/notification.proto'),
  path.resolve(__dirname, '../../../proto/notification.proto'),
  '/usr/src/app/proto/notification.proto',
].filter(Boolean);

const PROTO_PATH = candidateProtoPaths.find((p) => fs.existsSync(p)) || path.resolve(__dirname, '../../../proto/notification.proto');

// 1. Load the protobuf definition into a JavaScript package definition
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// 2. Load the gRPC package definition
const notificationProto = grpc.loadPackageDefinition(packageDefinition).notification;

/**
 * gRPC Handler for SendEmail RPC method
 * @param {Object} call - The gRPC call object containing the request payload
 * @param {Function} callback - Callback function to return the response or error
 */
const sendEmail = async (call, callback) => {
  try {
    const { recipient, subject, message } = call.request;

    // Validate incoming gRPC parameters
    if (!recipient || !subject || !message) {
      return callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: 'recipient, subject, and message are required fields',
      });
    }

    // Reuse EmailService to simulate and log the email
    await emailService.sendEmail({
      recipient,
      subject,
      message,
    });

    // Return gRPC response matching SendEmailResponse in notification.proto
    callback(null, {
      success: true,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('gRPC SendEmail Error:', error);
    callback({
      code: grpc.status.INTERNAL,
      message: error.message || 'Failed to dispatch email via gRPC',
    });
  }
};

/**
 * Initialize and start the gRPC Server
 */
export const startGrpcServer = () => {
  const server = new grpc.Server();
  const GRPC_PORT = process.env.GRPC_PORT || 50053;
  const GRPC_HOST = process.env.GRPC_HOST || '0.0.0.0';

  // Bind the NotificationService implementation to the gRPC server
  server.addService(notificationProto.NotificationService.service, {
    SendEmail: sendEmail,
  });

  server.bindAsync(
    `${GRPC_HOST}:${GRPC_PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error(`Failed to bind Notification gRPC Server: ${err.message}`);
        return;
      }
      console.log(`Notification Service gRPC is running on port ${port}`);
    }
  );

  return server;
};
