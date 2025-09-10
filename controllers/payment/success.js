import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import PaymentModel from '../../models/paymentModel.js';
import WorkerModel from '../../models/workerModel.js';
import UserModel from '../../models/userModel.js';
import StripeService from '../../services/stripeService.js';
import NotificationService from '../../services/notificationService.js';

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
      .populate('worker', 'fullName company')
      .populate('company', 'companyName')
      .populate('user', 'fullName email');

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

        if (paymentIntent) {
          // Try to get payment method from different sources
          let paymentMethodDetails = null;

          // Method 1: From charges
          if (
            paymentIntent.charges &&
            paymentIntent.charges.data &&
            paymentIntent.charges.data[0]
          ) {
            const charge = paymentIntent.charges.data[0];

            if (
              charge.payment_method_details &&
              charge.payment_method_details.card
            ) {
              paymentMethodDetails = {
                cardLast4: charge.payment_method_details.card.last4,
                cardBrand: charge.payment_method_details.card.brand,
              };
            }

            // Set receipt URL if available
            if (charge.receipt_url) {
              payment.receiptUrl = charge.receipt_url;
            }
          }

          // Method 2: From payment method object
          if (!paymentMethodDetails && paymentIntent.payment_method) {
            if (paymentIntent.payment_method.card) {
              paymentMethodDetails = {
                cardLast4: paymentIntent.payment_method.card.last4,
                cardBrand: paymentIntent.payment_method.card.brand,
              };
            }
          }

          // Set payment method if found
          if (paymentMethodDetails) {
            payment.paymentMethod = paymentMethodDetails;
          }
        }
      } catch (chargeError) {
        // Silently continue if payment method details can't be retrieved
      }

      await payment.save();

      // Update worker availability
      const worker = await WorkerModel.findById(payment.worker._id).populate(
        'company',
        'companyName user'
      );
      if (worker) {
        worker.availability = 'reserved';
        await worker.save();
      }

      // Get user details for notifications
      const user = await UserModel.findById(payment.user);

      // Send notifications
      try {
        // Notify user about successful payment
        await NotificationService.notifyPaymentSuccess(payment, user);

        // Notify admins about worker booking
        if (worker && user) {
          await NotificationService.notifyWorkerBooking(payment, worker, user);
        }
      } catch (notificationError) {
        // Log notification error but don't fail the payment process
        // eslint-disable-next-line no-console
        console.error(
          'Failed to send payment notifications:',
          notificationError
        );
      }
    }

    const responseData = {
      paymentId: payment._id,
      sessionId: sessionId,
      paymentStatus: session.payment_status,
      amount: session.amount_total / 100,
      currency: session.currency.toUpperCase(),
      trialDays: payment.trialInfo ? payment.trialInfo.trialDays : null,
      trialStarts: payment.trialInfo ? payment.trialInfo.trialStartDate : null,
      trialEnds: payment.trialInfo ? payment.trialInfo.trialEndDate : null,
      receiptUrl: payment.receiptUrl,
      worker: {
        name: payment.worker.fullName,
        company: payment.company.companyName,
      },
    };

    // Only include payment method if available
    if (payment.paymentMethod) {
      responseData.paymentMethod = payment.paymentMethod;
    }

    res.status(200).json({
      status: 'success',
      data: responseData,
    });
  } catch (error) {
    return next(new AppError(`Payment verification failed: ${error}`, 400));
  }
});
