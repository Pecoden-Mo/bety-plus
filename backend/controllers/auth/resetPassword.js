import crypto from 'crypto';
import userModel from '../../models/userModel.js';
import companyModel from '../../models/companyModel.js';
import rateLimiter from '../../configuration/rateLimiter.js';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';

const resetPassword = catchAsync(async (req, res, next) => {
  try {
    try {
      await rateLimiter.resetConfirmLimiter.consume(req.ip);
    } catch (rateLimiterRes) {
      return res.status(429).json({
        success: 'fail',
        message: 'Too many reset attempts. Try again later.',
        retryAfter: Math.round(rateLimiterRes.msBeforeNext / 1000),
      });
    }

    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return next(
        new AppError('Please provide a valid token and new password.', 400)
      );
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    let user = await userModel
      .findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      })
      .select('+password');

    if (!user) {
      user = await companyModel
        .findOne({
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { $gt: Date.now() },
        })
        .select('+password');
    }

    if (!user) {
      return next(new AppError('Invalid or expired reset token.', 400));
    }

    if (user.password) {
      const isSamePassword = user.correctPassword(newPassword);
      if (isSamePassword) {
        return next(
          new AppError('New password cannot be the same as the old one.', 400)
        );
      }
    }
    user.password = newPassword;

    user.clearResetToken();
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully.',
    });
  } catch (error) {
    console.error('Error in forgotPassword controller: ~File: ', error);
    return next(
      new AppError('An error occurred while processing your request.', 500)
    );
  }
});

export default resetPassword;
