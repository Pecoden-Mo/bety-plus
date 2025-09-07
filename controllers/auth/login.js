import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';
import userModel from '../../models/userModel.js';
import sendToken from '../../utils/sendToken.js';

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  sendToken(user, res);

  res.status(201).json({
    status: 'success',
    message: 'Login successful',
  });
});

export default login;
