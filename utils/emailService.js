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
        rejectUnauthorized: true,
      },
    });
  }

  async sendResetEmail(email, token, userAgent, ip) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const mailOptions = {
      from: `"Bety Plus" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Password Reset Request',
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
    };
    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true, message: 'Reset email sent successfully.' };
    } catch (error) {}
  }
}

export default new EmailService();
