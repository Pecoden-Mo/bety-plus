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
    const session = await StripeService.getCheckoutSession(sessionId);

    if (!session) {
      return next(new AppError('Invalid session', 400));
    }

    const payment = await PaymentModel.findOne({
      stripePaymentIntentId: session.id,
    })
      .populate('worker', 'fullName company')
      .populate('company', 'companyName')
      .populate('user', 'fullName email');

    if (!payment) {
      return next(new AppError('Payment record not found', 404));
    }
    const worker = await WorkerModel.findById(payment.worker._id).populate(
      'company',
      'companyName user'
    );
    if (session.payment_status === 'paid' && payment.status === 'pending') {
      payment.status = 'succeeded';

      try {
        const paymentIntent = await StripeService.getPayment(
          session.payment_intent
        );

        if (paymentIntent) {
          let paymentMethodDetails = null;

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

            if (charge.receipt_url) {
              payment.receiptUrl = charge.receipt_url;
            }
          }

          if (!paymentMethodDetails && paymentIntent.payment_method) {
            if (paymentIntent.payment_method.card) {
              paymentMethodDetails = {
                cardLast4: paymentIntent.payment_method.card.last4,
                cardBrand: paymentIntent.payment_method.card.brand,
              };
            }
          }

          if (paymentMethodDetails) {
            payment.paymentMethod = paymentMethodDetails;
          }
        }
      } catch (chargeError) {
        console.log('Failed to retrieve payment intent details:', chargeError);
      }

      await payment.save();

      if (worker) {
        worker.availability = 'reserved';
        await worker.save();
      }

      const user = await UserModel.findById(payment.user);

      // Send notifications
      try {
        await NotificationService.notifyPaymentSuccess(payment, user);

        // Notify admins about worker booking
        if (worker && user) {
          await NotificationService.notifyWorkerBooking(payment, worker, user);
        }
      } catch (notificationError) {
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
      arriveIn: worker.arrivalTime,
      receiptUrl: payment.receiptUrl,
      worker: {
        name: payment.worker.fullName,
        company: payment.company.companyName,
      },
    };

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
