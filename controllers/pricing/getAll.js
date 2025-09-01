import PricingModel from '../../models/pricingModel.js';
import catchAsync from '../../utils/catchAsync.js';

export default catchAsync(async (req, res) => {
  const { isActive, region } = req.query;

  // Build filter object
  const filter = {};
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  }
  if (region) {
    filter.region = region;
  }

  const pricing = await PricingModel.find(filter).sort({
    region: 1,
    createdAt: -1,
  });

  res.status(200).json({
    status: 'success',
    results: pricing.length,
    data: {
      pricing,
    },
  });
});
