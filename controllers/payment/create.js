import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import PaymentModel from '../../models/paymentModel.js';
import WorkerModel from '../../models/workerModel.js';
import UserModel from '../../models/userModel.js';
import StripeService from '../../services/stripeService.js';
import PricingService from '../../services/pricingService.js';

export default catchAsync(async (req, res, next) => {
  const { workerId, paymentType, depositPaymentId } = req.body;
  const userId = req.user.id;

  // Validate payment type
  if (!['deposit', 'full', 'remaining'].includes(paymentType)) {
    return next(new AppError('Invalid payment type', 400));
  }

  //  Get worker and validate availability
  const worker = await WorkerModel.findById(workerId).populate(
    'company',
    'user'
  );

  if (!worker) {
    return next(new AppError('Worker not found', 404));
  }

  // Get user details
  const user = await UserModel.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  // if (
  //   !user.fullName ||
  //   !user.email ||
  //   !user.city ||
  //   !user.phoneNumber.length ||
  //   !user.phoneNumber[0] ||
  //   !user.area ||
  //   !user.street ||
  //   !user.houseNumber ||
  //   !user.nationality ||
  //   !user.idPassportImage
  // ) {
  //   return next(
  //     new AppError('User profile incomplete, Please update your profile.', 400)
  //   );
  // }

  // Validate payment type logic based on worker location
  if (!worker.isInside && paymentType === 'deposit') {
    return next(
      new AppError('Trial payment not available for outside UAE workers', 400)
    );
  }

  // can delete in future
  if (worker.isInside && paymentType === 'full') {
    return next(
      new AppError(
        'Full payment not available for in side UAE workers, please choose trial payment first',
        400
      )
    );
  }

  if (paymentType === 'remaining' && !depositPaymentId) {
    return next(
      new AppError('Deposit payment ID required for remaining payment', 400)
    );
  }
  if (paymentType === 'deposit' || paymentType === 'full') {
    if (worker.availability !== 'currently available') {
      return next(new AppError('Worker is not available for booking', 400));
    }
  }

  let pricingData;
  let trialInfo = {};
  const relatedPayments = {};

  try {
    // Calculate pricing based on payment type
    if (paymentType === 'deposit') {
      pricingData = await PricingService.calculateTrialPrice(worker);
      trialInfo = {
        isTrialPayment: true,
        trialDays: pricingData.trialDays,
        originalFullAmount: pricingData.originalAmount,
      };
    } else if (paymentType === 'full') {
      pricingData = await PricingService.calculateFullPrice(worker);
    } else if (paymentType === 'remaining') {
      // Get deposit payment to calculate remaining amount
      const depositPayment = await PaymentModel.findById(depositPaymentId);
      if (!depositPayment || depositPayment.paymentType !== 'deposit') {
        return next(new AppError('Invalid deposit payment', 400));
      }

      pricingData = await PricingService.calculateRemainingPrice(
        worker,
        depositPayment.pricing.totalAmount
      );
      relatedPayments.depositPaymentId = depositPaymentId;
    }

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
      description: `${pricingData.description} - ${worker.fullName}`,
      workerId: workerId,
      metadata: {
        userId: userId.toString(),
        workerId: workerId,
        paymentType: paymentType,
        companyId: worker.company._id.toString(),
      },
    });

    // Create payment record with pending status
    const payment = await PaymentModel.create({
      user: userId,
      worker: workerId,
      company: worker.company._id,
      pricing: {
        basePrice: pricingData.basePrice,
        serviceFee: pricingData.serviceFee,
        deliveryFee: pricingData.deliveryFee,
        totalAmount: pricingData.totalAmount,
        currency: pricingData.currency,
      },
      paymentType,
      trialInfo,
      relatedPayments,
      stripePaymentIntentId: session.id,
      stripeCustomerId: customer.id,
      serviceMode: paymentType === 'deposit' ? 'booking' : 'purchase',
      status: 'pending',
    });

    // If this is a remaining payment, link it to the deposit payment
    if (paymentType === 'remaining' && depositPaymentId) {
      await PaymentModel.findByIdAndUpdate(depositPaymentId, {
        'relatedPayments.remainingPaymentId': payment._id,
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        paymentId: payment._id,
        checkoutUrl: session.url,
        sessionId: session.id,
        paymentType,
        pricing: pricingData,
        worker: {
          id: worker._id,
          name: worker.fullName,
          company: worker.company.companyName,
          isInside: worker.isInside,
        },
      },
    });
  } catch (error) {
    return next(new AppError(`Payment creation failed: ${error.message}`, 400));
  }
});
