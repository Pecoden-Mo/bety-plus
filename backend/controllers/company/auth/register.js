import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import userModel from '../../../models/userModel.js';
import companyModel from '../../../models/companyModel.js';
import sendToken from '../../../utils/sendToken.js';

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
  const company = await companyModel.findOne({ email }); // we can validate email and commercialLicenseNumber to be unique in the company model
  const checkCompany = await userModel.findOne({ email });
  if (company || checkCompany) {
    return next(new AppError('Email already exists', 400));
  }
  const newCompany = await companyModel.create({
    email,
    companyName,
    commercialLicenseNumber,
    commercialLicensePhoto,
    licensingAuthority,
    headOfficeAddress,
    password,
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
