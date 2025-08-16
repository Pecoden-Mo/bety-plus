import userModel from '../../models/userModel.js';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import sendToken from '../../utils/sendToken.js';

const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const { user } = req;
  const checkUser = await userModel.findById(user._id).select('+password');
  if (!checkUser) {
    return next(new AppError('User not found', 404));
  }
  if (!checkUser.comparePassword(currentPassword)) {
    return next(new AppError('Current password is incorrect', 400));
  }
  checkUser.password = newPassword;
  checkUser.passwordChangedAt = Date.now() - 1000;
  await checkUser.save();
  checkUser.password = undefined;
  sendToken(checkUser, res);

  res.status(200).json({
    status: 'success',
    message:
      'Password changed successfully. You remain logged in with a new session.',
    data: {
      user: checkUser,
    },
  });
});

export default changePassword;
