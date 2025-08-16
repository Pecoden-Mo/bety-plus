import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';
import userModel from '../../models/userModel.js';
import companyModel from '../../models/companyModel.js';
import sendToken from '../../utils/sendToken.js';

const register = catchAsync(async (req, res, next) => {

  const { email, password, phoneNumber, jobTitle, fullName } = req.body;

  const existingUser = await userModel.findOne({ email });
  const existingCompany = await companyModel.findOne({ email });

  if (existingUser || existingCompany) {
    return next(new AppError('Email already exists', 400));
  }

  const newUser = await userModel.create({
    email,
    password,
    phoneNumber,
    jobTitle,
    fullName,
    role: 'admin',
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
