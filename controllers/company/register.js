import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';
import userModel from '../../models/userModel.js';
import companyModel from '../../models/companyModel.js';
import sendToken from '../../utils/sendToken.js';
import NotificationService from '../../utils/notificationService.js';

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
  console.log(req.body);

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

  // Send notification to all admins about new company registration
  await NotificationService.notifyCompanyRegistration(newCompany);

  sendToken(newCompany, res);
  res.status(201).json({
    status: 'success',
    data: {
      company: newCompany,
    },
  });
});

export default register;
