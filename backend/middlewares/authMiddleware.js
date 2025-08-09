import AppError from '../utils/appError.js';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Company from '../models/companyModel.js';
import catchAsync from '../utils/catchAsync.js';

// check if the user is authenticated
export const isAuthenticated = catchAsync(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  let user = {};
  if (decoded.role === 'admin' || decoded.role === 'customer') {
    user = await User.findById(decoded.id);
    if (!user) {
      return next(
        new AppError('The user belonging to this token does not exist.', 401)
      );
    }
  }
  if (decoded.role === 'company') {
    user = await Company.findById(decoded.id);
    if (!user) {
      return next(
        new AppError('The company belonging to this token does not exist.', 401)
      );
    }
  }
  if (!user) {
    return next(
      new AppError(
        'The user or company belonging to this token does not exist.',
        401
      )
    );
  }
  if (user.passwordChangedAfter && user.passwordChangedAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  req.user = user;
  next();
});

export default {
  isAuthenticated,
};
