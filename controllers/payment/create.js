import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import PaymentModel from '../../models/paymentModel.js';
import WorkerModel from '../../models/workerModel.js';
import UserModel from '../../models/userModel.js';
import StripeService from '../../services/stripeService.js';
import PricingService from '../../services/pricingService.js';

export default catchAsync(async (req, res, next) => {
  const { workerId, serviceType = 'housemaid' } = req.body;
  const userId = req.user.id;

  // Get worker and calculate dynamic pricing
  const worker = await WorkerModel.findById(workerId).populate(
    'company',
    'companyName user'
  );

  if (!worker) {
    return next(new AppError('Worker not found', 404));
  }

  if (worker.availability !== 'currently available') {
    return next(new AppError('Worker is not available for booking', 400));
  }

  // Get user details
  const user = await UserModel.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Calculate dynamic pricing
  const pricingData = await PricingService.calculatePrice(worker, serviceType);

  try {
    // Create or get Stripe customer
    const customer = await StripeService.createOrGetCustomer(user);

    // Save customer ID to user if not exists
    if (!user.stripeCustomerId) {
      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // Create Stripe Checkout Session
    const session = await StripeService.createCheckoutSession({
      amount: pricingData.totalAmount,
      currency: pricingData.currency,
      customer,
      description: `خدمة ${serviceType} - ${worker.fullName}`,
      workerId: workerId,
      metadata: {
        userId: userId.toString(),
        workerId: workerId,
        serviceType: serviceType,
        companyId: worker.company._id.toString(),
      },
    });
    console.log(session);

    // Create payment record with pending status
    const payment = await PaymentModel.create({
      user: userId,
      worker: workerId,
      company: worker.company._id,
      pricing: pricingData,
      stripePaymentIntentId: session.id,
      stripeCustomerId: customer.id,
      serviceType: serviceType,
      status: 'pending',
    });

    res.status(200).json({
      status: 'success',
      data: {
        paymentId: payment._id,
        checkoutUrl: session.url,
        sessionId: session.id,
        pricing: pricingData,
        worker: {
          id: worker._id,
          name: worker.fullName,
          company: worker.company.companyName,
        },
      },
    });
  } catch (error) {
    return next(new AppError(`Payment creation failed: ${error.message}`, 400));
  }
});
