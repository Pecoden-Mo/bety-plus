import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import sendToken from '../../../utils/sendToken.js';

const authCallback = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication failed try again', 401));
  }
  const { user } = req;
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  if (user.password) user.password = undefined;

  sendToken(user, res);
  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export default authCallback;
