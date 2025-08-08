import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import userModel from '../../../models/userModel.js';
import sendToken from '../../../utils/sendToken.js';

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select('+password');

  if (!user || !user.password) {
    return next(new AppError('Invalid email or password', 401));
  }
  if (!(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }
  user.password = undefined;
  sendToken(user, res);

  res.status(200).json({
    status: 'success',
    data: {
      user: user,
    },
  });
});

export default login;
