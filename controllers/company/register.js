import mongoose from 'mongoose';
import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';
import userModel from '../../models/userModel.js';
import companyModel from '../../models/companyModel.js';
import sendToken from '../../utils/sendToken.js';
import NotificationService from '../../services/notificationService.js';

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

  // Check if user already exists
  const checkUser = await userModel.findOne({ email });
  if (checkUser) {
    return next(new AppError('Email already exists', 400));
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const [newUser] = await userModel.create(
      [
        {
          email,
          password,
          role: 'company',
        },
      ],
      { session }
    );

    const userResponse = newUser.toObject();
    delete userResponse.password;

    const [newCompany] = await companyModel.create(
      [
        {
          companyName,
          commercialLicenseNumber,
          commercialLicensePhoto,
          licensingAuthority,
          headOfficeAddress,
          user: newUser._id,
        },
      ],
      { session }
    );
    await session.commitTransaction();

    try {
      await NotificationService.notifyCompanyRegistration(newCompany);
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
    }

    sendToken(newUser, res);

    res.status(201).json({
      status: 'success',
      message: 'Company registration successful',
      // data: {
      //   user: userResponse,
      //   company: newCompany,
      // },
    });
  } catch (error) {
    await session.abortTransaction();
    return next(new AppError(error, 500));
  } finally {
    session.endSession();
  }
});

export default register;
