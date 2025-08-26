import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import companyModel from '../../models/companyModel.js';

export default catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const company = await companyModel
    .findOne({ user: userId })
    .populate('user', 'email fullName')
    .populate('approvedBy', 'email fullName');

  if (!company) {
    return next(new AppError('Company not found for this user', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      company,
    },
  });
});
