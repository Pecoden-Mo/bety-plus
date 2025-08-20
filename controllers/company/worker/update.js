import catchAsync from '../../../utils/catchAsync.js';
import AppError from '../../../utils/appError.js';
import workerModel from '../../../models/workerModel.js';

export default catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const companyId = req.user.company;

  const worker = await workerModel
    .findOneAndUpdate({ _id: id, company: companyId }, req.body, {
      new: true,
      runValidators: true,
    })
    .populate('company', 'companyName')
    .populate('createdBy', 'email');

  if (!worker) {
    return next(new AppError('Worker not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      worker,
    },
  });
});
// TODO
// Add validation for the request body to ensure required fields are present
