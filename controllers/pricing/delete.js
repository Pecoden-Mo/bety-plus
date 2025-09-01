import PricingModel from '../../models/pricingModel.js';
import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';

export default catchAsync(async (req, res, next) => {
  const pricing = await PricingModel.findById(req.params.id);

  if (!pricing) {
    return next(new AppError('Pricing record not found', 404));
  }

  await PricingModel.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
