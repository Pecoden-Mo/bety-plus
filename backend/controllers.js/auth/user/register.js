import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import userModel from '../../../models/userModel.js';
import jwt from 'jsonwebtoken';

const register = catchAsync(async (req, res, next) => {
  console.log(req.body);

  const { email, password } = req.body;

  const existingUser = await userModel.findOne({ email });

  if (existingUser) {
    return next(new AppError('Email already exists', 400));
  }

  const newUser = await userModel.create({
    email,
    password,
  });
  newUser.password = undefined;
  const token = jwt.sign({ user: newUser }, process.env.JWT_SECRET, {
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
      user: newUser,
      token,
    },
  });
});

export default register;
