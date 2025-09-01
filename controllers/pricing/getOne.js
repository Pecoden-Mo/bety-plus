import PricingModel from '../../models/pricingModel.js';
import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';

export default catchAsync(async (req, res, next) => {
  const pricing = await PricingModel.findById(req.params.id);

  if (!pricing) {
    return next(new AppError('Pricing record not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      pricing,
    },
  });
});
