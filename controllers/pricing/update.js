import PricingModel from '../../models/pricingModel.js';
import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';

export default catchAsync(async (req, res, next) => {
  const { currency, serviceFee, deliveryFee, isActive } = req.body;

  // Find the pricing record
  const pricing = await PricingModel.findById(req.params.id);
  if (!pricing) {
    return next(new AppError('Pricing record not found', 404));
  }

  // Update fields
  if (currency !== undefined) pricing.currency = currency;
  if (isActive !== undefined) pricing.isActive = isActive;

  // Update fees if provided
  if (serviceFee !== undefined) {
    pricing.fees.serviceFee = serviceFee;
  }
  if (deliveryFee !== undefined) {
    pricing.fees.deliveryFee = deliveryFee;
  }

  const updatedPricing = await pricing.save();

  res.status(200).json({
    status: 'success',
    data: {
      pricing: updatedPricing,
    },
  });
});
