import PricingModel from '../../models/pricingModel.js';
import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';

export default catchAsync(async (req, res, next) => {
  const { region } = req.params;

  if (!['UAE', 'Outside_UAE'].includes(region)) {
    return next(
      new AppError('Invalid region. Must be UAE or Outside_UAE', 400)
    );
  }

  const pricing = await PricingModel.findOne({
    region,
    isActive: true,
  });

  if (!pricing) {
    return next(
      new AppError(`No active pricing found for region: ${region}`, 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: {
      pricing,
    },
  });
});
