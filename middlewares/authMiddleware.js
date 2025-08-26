import jwt from 'jsonwebtoken';
import AppError from '../utils/appError.js';
import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';

// check if the user is authenticated
export const isAuthenticated = catchAsync(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    res.clearCookie('token');
    return next(
      new AppError('The user belonging to this token does not exist.', 401)
    );
  }

  if (user.passwordChangedAt && user.passwordChangedAfter(decoded.iat)) {
    res.clearCookie('token');
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  req.user = {
    id: user._id,
    role: user.role,
  };
  next();
});

export default {
  isAuthenticated,
};

export const allowTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
