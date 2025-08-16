import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';
import userModel from '../../models/userModel.js';
import companyModel from '../../models/companyModel.js';
import sendToken from '../../utils/sendToken.js';
import sendNotification from '../../utils/notification.js';

const register = catchAsync(async (req, res, next) => {
  const {
    email,
    companyName,
    commercialLicenseNumber,
    commercialLicensePhoto,
    licensingAuthority,
    headOfficeAddress,
    password,
  } = req.body;

  const checkUser = await userModel.findOne({ email });
  if (checkUser) {
    return next(new AppError('Email already exists', 400));
  }
  const newUser = await userModel.create({
    email,
    password,
    role: 'company',
  });
  newUser.password = undefined;
  const newCompany = await companyModel.create({
    companyName,
    commercialLicenseNumber,
    commercialLicensePhoto,
    licensingAuthority,
    headOfficeAddress,
    user: newUser._id,
  });
  sendNotification({
    type: 'company_registration',
    title: 'Company Registration',
    message:
      'Your company has been registered successfully, waiting for approval',
    recipient: newUser._id,
    recipientType: 'User',
  });
  // send notification to admin
  const admin = await userModel.findOne({ role: 'admin' });
  sendNotification({
    type: 'company_registration_pending',
    title: 'Company Registration',
    message: 'A new company has been registered, waiting for approval',
    recipient: admin._id,
    recipientType: 'User',
    companyId: newCompany._id,
  });
  sendToken(newCompany, res);
  res.status(201).json({
    status: 'success',
    data: {
      company: newCompany,
    },
  });
});

export default register;
