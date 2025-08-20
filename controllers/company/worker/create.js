import catchAsync from '../../../utils/catchAsync.js';
import workerModel from '../../../models/workerModel.js';
import companyModel from '../../../models/companyModel.js';
import AppError from '../../../utils/appError.js';

export default catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const company = await companyModel.findOne({ user: userId });
  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  req.body.company = company._id;
  req.body.createdBy = userId;

  const worker = await workerModel.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      worker,
    },
  });
});
