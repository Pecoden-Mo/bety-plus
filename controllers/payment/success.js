import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import PaymentModel from '../../models/paymentModel.js';
import WorkerModel from '../../models/workerModel.js';
import StripeService from '../../services/stripeService.js';

export default catchAsync(async (req, res, next) => {
  const { session_id: sessionId } = req.query;

  if (!sessionId) {
    return next(new AppError('Session ID is required', 400));
  }

  try {
    // Get session details from Stripe
    const session = await StripeService.getCheckoutSession(sessionId);
    // console.log(session);

    if (!session) {
      return next(new AppError('Invalid session', 400));
    }

    // Find payment record
    const payment = await PaymentModel.findOne({
      stripePaymentIntentId: session.id,
    })
      .populate('worker', 'fullName')
      .populate('company', 'companyName');

    if (!payment) {
      return next(new AppError('Payment record not found', 404));
    }

    // Update payment status based on session
    if (session.payment_status === 'paid' && payment.status === 'pending') {
      payment.status = 'succeeded';

      // Get payment intent for receipt URL and payment method details
      try {
        const paymentIntent = await StripeService.getPayment(
          session.payment_intent
        );

        if (
          paymentIntent &&
          paymentIntent.charges &&
          paymentIntent.charges.data &&
          paymentIntent.charges.data[0]
        ) {
          const charge = paymentIntent.charges.data[0];

          // Safely extract payment method details
          if (
            charge.payment_method_details &&
            charge.payment_method_details.card
          ) {
            payment.paymentMethod = {
              cardLast4: charge.payment_method_details.card.last4,
              cardBrand: charge.payment_method_details.card.brand,
            };
          }

          // Set receipt URL if available
          if (charge.receipt_url) {
            payment.receiptUrl = charge.receipt_url;
          }
        }
      } catch (chargeError) {
        console.error('Error fetching payment intent:', chargeError);
      }

      await payment.save();
      console.log(payment);

      // Update worker availability
      const worker = await WorkerModel.findById(payment.worker._id);
      if (worker) {
        worker.availability = 'reserved';
        await worker.save();
      }
      console.log(worker);
    }

    res.status(200).json({
      status: 'success',
      data: {
        paymentId: payment._id,
        sessionId: sessionId,
        paymentStatus: session.payment_status,
        amount: session.amount_total / 100,
        currency: session.currency.toUpperCase(),
        receiptUrl: payment.receiptUrl,
        worker: {
          name: payment.worker.fullName,
          company: payment.company.companyName,
        },
        paymentMethod: payment.paymentMethod,
      },
    });
  } catch (error) {
    return next(new AppError(`Payment verification failed: ${error}`, 400));
  }
});
