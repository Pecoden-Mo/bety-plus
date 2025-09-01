import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import userModel from '../../models/userModel.js';

// Get user profile
export const getProfile = catchAsync(async (req, res, next) => {
  const user = await userModel.findById(req.user.id).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// Check profile completion status
export const checkProfileCompletion = catchAsync(async (req, res, next) => {
  const user = await userModel.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const requiredFields = [
    'fullName',
    'primaryPhone',
    'city',
    'area',
    'nationality',
  ];

  const missingFields = [];

  requiredFields.forEach((field) => {
    if (!user[field]) {
      missingFields.push(field);
    }
  });

  const isComplete = missingFields.length === 0;
  const completionPercentage = Math.round(
    ((requiredFields.length - missingFields.length) / requiredFields.length) *
      100
  );

  res.status(200).json({
    status: 'success',
    data: {
      isComplete,
      completionPercentage,
      missingFields,
      requiredFields,
    },
  });
});

export default {
  getProfile,
  checkProfileCompletion,
};
