import Stripe from 'stripe';
import AppError from '../utils/appError.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
  static async createOrGetCustomer(user) {
    try {
      if (user.stripeCustomerId) {
        const customer = await stripe.customers.retrieve(user.stripeCustomerId);
        return customer;
      }

      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: {
          userId: user._id.toString(),
          role: user.role,
        },
      });

      return customer;
    } catch (error) {
      throw new AppError(`Stripe customer error: ${error.message}`, 400);
    }
  }

  static async createCheckoutSession(data) {
    try {
      const { amount, currency, customer, metadata, description, workerId } =
        data;

      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: currency.toLowerCase(),
              product_data: {
                name: description || 'خدمة عاملة منزلية',
                description: `Worker ID: ${workerId}`,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
        metadata: metadata || {},
        payment_intent_data: {
          metadata: metadata || {},
        },
        locale: 'en',
      });

      return session;
    } catch (error) {
      throw new AppError(
        `Checkout session creation failed: ${error.message}`,
        400
      );
    }
  }

  static async getCheckoutSession(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      throw new AppError(`Session retrieval failed: ${error.message}`, 400);
    }
  }

  static async getPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId,
        {
          expand: ['charges.data.payment_method_details', 'payment_method'],
        }
      );
      return paymentIntent;
    } catch (error) {
      throw new AppError(`Payment retrieval failed: ${error.message}`, 400);
    }
  }

  static async refundPayment(paymentIntentId, amount = null) {
    try {
      const refundData = { payment_intent: paymentIntentId };
      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create(refundData);
      return refund;
    } catch (error) {
      throw new AppError(`Refund failed: ${error.message}`, 400);
    }
  }
}

export default StripeService;
