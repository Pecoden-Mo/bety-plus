import catchAsync from '../../../utils/catchAsync.js';
import AppError from '../../../utils/appError.js';
import workerModel from '../../../models/workerModel.js';

export default catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const companyId = req.user.company;

  const worker = await workerModel.findOneAndDelete({
    _id: id,
    company: companyId,
  });

  if (!worker) {
    return next(new AppError('Worker not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
// TODO
// Add validation to ensure the worker exists before attempting to delete
// Consider adding a check to ensure the user has permission to delete the worker
// Add logging for the deletion action if necessary
