import { emailService } from '../services/emailService.js';

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

/**
 * @desc    Send an email notification
 * @route   POST /send-email or POST /api/send-email
 * @access  Public
 */
export const sendEmail = async (req, res, next) => {
  try {
    const { recipient, subject, message } = req.body;

    // 1. Validate required fields
    if (!recipient || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: recipient, subject, and message',
      });
    }

    // 2. Validate email format
    if (typeof recipient !== 'string' || !EMAIL_REGEX.test(recipient.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid recipient email address',
      });
    }

    // 3. Validate subject and message types and non-empty content
    if (typeof subject !== 'string' || subject.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Subject must be a non-empty string',
      });
    }

    if (typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message must be a non-empty string',
      });
    }

    // 4. Delegate to emailService layer
    const result = await emailService.sendEmail({
      recipient: recipient.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });

    // 5. Return success response
    return res.status(200).json({
      success: true,
      message: 'Email notification sent successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
