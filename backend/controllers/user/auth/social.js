import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import jwt from 'jsonwebtoken';

const authCallback = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication failed try again', 401));
  }
  const user = req.user;

  if (user.password) user.password = undefined;

  const token = jwt.sign({ user }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseInt(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
  });
  res.status(200).json({
    status: 'success',
    token,
    user,
  });
});

export default authCallback;
