import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import userModel from '../../../models/userModel.js';
import sendToken from '../../../utils/sendToken.js';

const register = catchAsync(async (req, res, next) => {
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
  sendToken(newUser, res);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

export default register;
