import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
      // Optimize connection settings for better performance
      pool: true, // Use connection pooling
      maxConnections: 5, // Max concurrent connections
      maxMessages: 100, // Max messages per connection
      connectionTimeout: 10000, // 10 seconds (reduced from 60)
      greetingTimeout: 5000, // 5 seconds (reduced from 30)
      socketTimeout: 10000, // 10 seconds (reduced from 60)
      // Add keep-alive to reuse connections
      keepAlive: true,
      // Reduce DNS lookup time
      family: 4, // Force IPv4
    });

    // Verify transporter configuration on startup
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      // eslint-disable-next-line no-console
      console.log('Email service is ready to send emails');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Email service verification failed:', error.message);
    }
  }

  async sendResetEmail(email, token, userAgent, ip) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"Bety Plus" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Request - Bety Plus',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your account.</p>
          <p><strong>Security Information:</strong></p>
          <ul>
            <li>Request from IP: ${ip}</li>
            <li>Browser: ${userAgent}</li>
            <li>Time: ${new Date().toISOString()}</li>
          </ul>
          <p>Click the link below to reset your password. This link will expire in 15 minutes:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="margin-top: 20px; color: #666;">If you didn't request this reset, please ignore this email and consider changing your password.</p>
          <p style="color: #999; font-size: 12px;">This is an automated message. Please do not reply.</p>
        </div>
      `,
      // Add text fallback for better delivery
      text: `Password Reset Request
      
You requested a password reset for your account.

Security Information:
- Request from IP: ${ip}
- Browser: ${userAgent}
- Time: ${new Date().toISOString()}

Reset your password by visiting: ${resetUrl}

This link will expire in 15 minutes.

If you didn't request this reset, please ignore this email and consider changing your password.`,
    };

    try {
      const startTime = Date.now();
      const info = await this.transporter.sendMail(mailOptions);
      const duration = Date.now() - startTime;

      // eslint-disable-next-line no-console
      console.log(`Email sent successfully in ${duration}ms:`, info.messageId);

      return {
        success: true,
        message: 'Reset email sent successfully.',
        messageId: info.messageId,
        duration,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to send reset email:', error);
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  // Add a method to send emails in background (non-blocking)
  async sendResetEmailAsync(email, token, userAgent, ip) {
    // Don't await - send in background
    this.sendResetEmail(email, token, userAgent, ip)
      .then((result) => {
        if (!result.success) {
          // eslint-disable-next-line no-console
          console.error('Background email failed:', result.error);
        }
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Background email error:', error);
      });

    // Return immediately
    return { success: true, message: 'Email queued for sending' };
  }
}

export default new EmailService();
