import catchAsync from '../../utils/catchAsync.js';
import PaymentModel from '../../models/paymentModel.js';

export default catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  const userId = req.user.id;

  const filter = { user: userId };
  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const payments = await PaymentModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('worker', 'fullName nationality currentLocation')
    .populate('company', 'companyName');

  const total = await PaymentModel.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});
