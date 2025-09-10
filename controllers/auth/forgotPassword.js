import userModel from '../../models/userModel.js';
import emailService from '../../utils/emailService.js';
import rateLimiter from '../../config/rateLimiter.js';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';

const forgotPassword = catchAsync(async (req, res, next) => {
  try {
    try {
      await rateLimiter.resetRequestLimiter.consume(req.ip);
    } catch (rateLimiterRes) {
      return res.status(429).json({
        status: 'fail',
        message: 'Too many requests, please try again later.',
        retryAfter: Math.round(rateLimiterRes.msBeforeNext / 1000),
      });
    }
    const email = req.body.email.toLowerCase().trim();

    if (!email) {
      return next(new AppError('Please provide your email address.', 400));
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(200).json({
        status: 'success',
        message: 'Check your box, a reset link has been sent.',
      });
    }
    if (user.lastResetRequest && Date.now() - user.lastResetRequest < 60000) {
      return res.status(200).json({
        status: 'success',
        message:
          'If an account with that email exists, a reset link has been sent.',
      });
    }
    const resetToken = user.generateResetToken();

    user.lastResetRequest = Date.now();
    try {
      await user.save({ validateBeforeSave: false });

      // Send reset email asynchronously - don't wait for it
      setImmediate(() => {
        emailService
          .sendResetEmail(email, resetToken, req.get('User-Agent'), req.ip)
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error('Email sending failed:', error);
          });
      });

      res.status(200).json({
        status: 'success',
        message:
          'If an account with that email exists, a reset link has been sent.',
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to process your request. Please try again later.',
      });
      // eslint-disable-next-line no-console
      console.error('Password reset request error:', error);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error in forgotPassword controller: ~File: ', error);
    return next(
      new AppError('An error occurred while processing your request.', 500)
    );
  }
});

export default forgotPassword;
