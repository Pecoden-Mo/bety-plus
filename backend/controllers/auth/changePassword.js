import userModel from '../../models/userModel.js';
import companyModel from '../../models/companyModel.js';
import emailService from '../../utils/emailService.js';
import rateLimiter from '../../configuration/rateLimiter.js';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';

const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = req.user;
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  console.log(user);
});

export default changePassword;
