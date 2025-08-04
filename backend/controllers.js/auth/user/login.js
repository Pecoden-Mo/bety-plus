import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import userModel from '../../../models/userModel.js';
import jwt from 'jsonwebtoken';

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
  const token = jwt.sign({ user: user }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXPIRES_IN || '30d',
  });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
  });
  res.status(201).json({
    status: 'success',
    data: {
      user: user,
      token,
    },
  });
});

export default login;
