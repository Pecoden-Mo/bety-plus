import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import PaymentModel from '../../models/paymentModel.js';
import WorkerModel from '../../models/workerModel.js';
import PricingService from '../../services/pricingService.js';

export default catchAsync(async (req, res, next) => {
  const { depositPaymentId } = req.params;
  const userId = req.user.id;

  // Find the deposit payment
  const depositPayment = await PaymentModel.findById(depositPaymentId)
    .populate('worker')
    .populate('company', 'companyName');

  if (!depositPayment) {
    return next(new AppError('Deposit payment not found', 404));
  }

  // Verify the payment belongs to the user
  if (depositPayment.user.toString() !== userId) {
    return next(new AppError('Unauthorized access to payment', 403));
  }

  // Verify it's a deposit payment and succeeded
  if (depositPayment.paymentType !== 'deposit') {
    return next(new AppError('Payment is not a deposit payment', 400));
  }

  if (depositPayment.status !== 'succeeded') {
    return next(new AppError('Deposit payment has not succeeded', 400));
  }

  // Check if remaining payment already exists
  if (depositPayment.relatedPayments.remainingPaymentId) {
    return next(new AppError('Remaining payment already exists', 400));
  }

  // Check if trial period has ended (optional - you may want to allow early completion)
  const now = new Date();
  if (
    depositPayment.trialInfo.trialEndDate &&
    now < depositPayment.trialInfo.trialEndDate
  ) {
    const daysLeft = Math.ceil(
      (depositPayment.trialInfo.trialEndDate - now) / (1000 * 60 * 60 * 24)
    );
    return res.status(200).json({
      status: 'info',
      message: `Trial period is still active. ${daysLeft} days remaining.`,
      data: {
        trialEndDate: depositPayment.trialInfo.trialEndDate,
        daysLeft,
        canCompleteEarly: true, // Allow early completion if desired
      },
    });
  }

  // Calculate remaining amount
  const remainingAmount =
    depositPayment.trialInfo.originalFullAmount -
    depositPayment.pricing.totalAmount;

  // Get worker details for pricing calculation
  const worker = await WorkerModel.findById(depositPayment.worker);
  const remainingPricing = await PricingService.calculateRemainingPrice(
    worker,
    depositPayment.pricing.totalAmount
  );

  res.status(200).json({
    status: 'success',
    data: {
      depositPayment: {
        id: depositPayment._id,
        amount: depositPayment.pricing.totalAmount,
        currency: depositPayment.pricing.currency,
        trialInfo: depositPayment.trialInfo,
      },
      remainingPayment: {
        amount: remainingAmount,
        currency: depositPayment.pricing.currency,
        pricing: remainingPricing,
      },
      worker: {
        id: worker._id,
        name: worker.fullName,
        company: depositPayment.company.companyName,
      },
    },
  });
});
// TODO will start form here
