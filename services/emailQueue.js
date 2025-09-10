import emailService from '../utils/emailService.js';

class EmailQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 seconds
  }

  // Add email to queue
  async addToQueue(emailData) {
    this.queue.push(
      Object.assign({}, emailData, {
        attempts: 0,
        createdAt: new Date(),
      })
    );

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }
  }

  // Process email queue
  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const emailData = this.queue.shift();

      try {
        let result;

        switch (emailData.type) {
          case 'reset_password':
            result = await emailService.sendResetEmail(
              emailData.email,
              emailData.token,
              emailData.userAgent,
              emailData.ip
            );
            break;
          default:
            throw new Error(`Unknown email type: ${emailData.type}`);
        }

        if (!result.success) {
          throw new Error(result.error);
        }

        // eslint-disable-next-line no-console
        console.log(
          `Email sent successfully: ${emailData.type} to ${emailData.email}`
        );
      } catch (error) {
        emailData.attempts += 1;
        emailData.lastError = error.message;

        if (emailData.attempts < this.maxRetries) {
          // Retry after delay
          setTimeout(() => {
            this.queue.unshift(emailData); // Add back to front of queue
            if (!this.processing) {
              this.processQueue();
            }
          }, this.retryDelay * emailData.attempts);

          // eslint-disable-next-line no-console
          console.log(
            `Email failed, will retry (${emailData.attempts}/${this.maxRetries}): ${error.message}`
          );
        } else {
          // eslint-disable-next-line no-console
          console.error(
            `Email failed permanently after ${this.maxRetries} attempts:`,
            error.message
          );
        }
      }

      // Small delay between emails to avoid overwhelming SMTP server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.processing = false;
  }

  // Send reset password email via queue
  async sendResetPasswordEmail(email, token, userAgent, ip) {
    await this.addToQueue({
      type: 'reset_password',
      email,
      token,
      userAgent,
      ip,
    });

    return { success: true, message: 'Email queued for sending' };
  }

  // Get queue status
  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
    };
  }
}

export default new EmailQueue();
