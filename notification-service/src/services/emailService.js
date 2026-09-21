import crypto from 'crypto';
import { emailConfig } from '../config/emailConfig.js';

/**
 * Service to handle email dispatching.
 * Designed as a pluggable abstraction layer so real providers (SendGrid, Nodemailer, AWS SES)
 * can be integrated without modifying the controller.
 */
class EmailService {
  /**
   * Send an email (Simulated for v1)
   * @param {Object} options
   * @param {string} options.recipient - Destination email address
   * @param {string} options.subject - Email subject line
   * @param {string} options.message - Email body content
   * @returns {Promise<Object>} Result metadata of the dispatched email
   */
  async sendEmail({ recipient, subject, message }) {
    const messageId = `msg_${crypto.randomUUID()}`;
    const sentAt = new Date().toISOString();

    // 1. Simulate async network latency for sending an email
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 2. Structured logging of the simulated email
    console.log('====================================================');
    console.log('📧 [EMAIL NOTIFICATION DISPATCHED]');
    console.log(`• Message ID: ${messageId}`);
    console.log(`• From:       ${emailConfig.fromAddress}`);
    console.log(`• To:         ${recipient}`);
    console.log(`• Subject:    ${subject}`);
    console.log(`• Body:       ${message}`);
    console.log(`• Timestamp:  ${sentAt}`);
    console.log('====================================================');

    // 3. Return metadata
    return {
      messageId,
      recipient,
      subject,
      status: 'SENT',
      provider: emailConfig.provider,
      sentAt,
    };
  }
}

export const emailService = new EmailService();
