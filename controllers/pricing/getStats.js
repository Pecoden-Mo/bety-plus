import PricingModel from '../../models/pricingModel.js';
import catchAsync from '../../utils/catchAsync.js';

export default catchAsync(async (req, res) => {
  console.log('Fetching pricing statistics...');

  const stats = await PricingModel.aggregate([
    {
      $group: {
        _id: '$region',
        count: { $sum: 1 },
        activeCount: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
        },
        avgServiceFee: { $avg: '$fees.serviceFee' },
        minServiceFee: { $min: '$fees.serviceFee' },
        maxServiceFee: { $max: '$fees.serviceFee' },
        avgDeliveryFee: { $avg: '$fees.deliveryFee' },
        minDeliveryFee: { $min: '$fees.deliveryFee' },
        maxDeliveryFee: { $max: '$fees.deliveryFee' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  const totalRecords = await PricingModel.countDocuments();
  const activeRecords = await PricingModel.countDocuments({ isActive: true });

  res.status(200).json({
    status: 'success',
    data: {
      summary: {
        totalRecords,
        activeRecords,
        inactiveRecords: totalRecords - activeRecords,
      },
      regionStats: stats,
    },
  });
});
