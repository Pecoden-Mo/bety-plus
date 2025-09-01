import PricingModel from '../../models/pricingModel.js';
import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';

export default catchAsync(async (req, res, next) => {
  const { region, currency, serviceFee, deliveryFee, isActive } = req.body;

  // Check if pricing for this region already exists
  const existingPricing = await PricingModel.findOne({ region });

  if (existingPricing) {
    return next(
      new AppError(
        `Pricing for region ${region} already exists. Use update instead.`,
        400
      )
    );
  }

  // Validate region
  if (!['UAE', 'Outside_UAE'].includes(region)) {
    return next(
      new AppError('Invalid region. Must be UAE or Outside_UAE', 400)
    );
  }

  const pricingData = {
    region,
    currency: currency || 'AED',
    fees: {
      serviceFee: serviceFee || 0,
      deliveryFee: deliveryFee || 0,
    },
    isActive: isActive !== undefined ? isActive : true,
  };

  const pricing = await PricingModel.create(pricingData);

  res.status(201).json({
    status: 'success',
    data: {
      pricing,
    },
  });
});
