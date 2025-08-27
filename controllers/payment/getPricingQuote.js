import catchAsync from '../../utils/catchAsync.js';
import PricingService from '../../services/pricingService.js';

export default catchAsync(async (req, res, next) => {
  const { workerId } = req.params;

  const quote = await PricingService.getPricingQuote(workerId);

  res.status(200).json({
    status: 'success',
    data: quote,
  });
});
