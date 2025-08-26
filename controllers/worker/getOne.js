import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import workerModel from '../../models/workerModel.js';

export default catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const worker = await workerModel
    .findOne({
      _id: id,
      status: 'approved',
      availability: 'currently available',
    })
    .select('-company -__v -createdBy -status');

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
