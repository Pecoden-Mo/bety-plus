import catchAsync from '../../../utils/catchAsync.js';
import AppError from '../../../utils/appError.js';
import workerModel from '../../../models/workerModel.js';
import companyModel from '../../../models/companyModel.js';

export default catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const company = await companyModel.findOne({ user: req.user.id });

  const worker = await workerModel.findOneAndDelete({
    _id: id,
    company: company._id,
  });

  if (!worker) {
    return next(new AppError('Worker not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
