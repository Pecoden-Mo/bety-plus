import mongoose from 'mongoose';
/* TODO
 *  user can take worker for 7 days then user can take it for 1 year or come back after 7 days if worker form UAE
 * after 7 days send message to whatsapp number to come back to system
 */
const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    pricing: {
      basePrice: Number,
      serviceFee: Number,
      deliveryFee: Number,
      totalAmount: Number,
      currency: String,
    },
    stripePaymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    stripeCustomerId: {
      type: String,
    },
    paymentMethod: {
      cardLast4: String, // e.g., '4242'
      cardBrand: String, // e.g., 'visa', 'mastercard'
      cardHolderName: String, // e.g., 'John Doe'
    },
    paymentType: {
      type: String,
      enum: ['deposit', 'full', 'remaining'],
      required: true,
      default: 'full',
    },
    trialInfo: {
      isTrialPayment: {
        type: Boolean,
        default: false,
      },
      trialDays: {
        type: Number,
        default: 0,
      },
      originalFullAmount: {
        type: Number,
      },
      trialStartDate: {
        type: Date,
      },
      trialEndDate: {
        type: Date,
      },
    },
    relatedPayments: {
      depositPaymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
      },
      remainingPaymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    serviceMode: {
      type: String,
      enum: ['booking', 'purchase', 'refund'],
      required: [true, 'Service mode is required'],
    },
    workerDeployment: {
      status: {
        type: String,
        enum: ['pending_dispatch', 'dispatched', 'arrived'],
        default: 'pending_dispatch',
      },
      dispatchDate: {
        type: Date,
      },
      actualArrivalDate: {
        type: Date,
      },
    },
    receiptUrl: String,
    refund: {
      guaranteeRefunded: {
        type: Boolean,
        default: false,
      },
      refundedAmount: {
        type: Number,
        default: 0,
      },
      refundDate: Date,
    },
    endDate: Date,
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });
// after update payment status to succeeded set endDate for worker based on payment type and worker location
paymentSchema.pre('save', async function (next) {
  // Only set end dates when worker arrives, not when payment succeeds
  if (
    this.isModified('workerDeployment.status') &&
    this.workerDeployment.status === 'arrived'
  ) {
    const now = new Date();
    // Handle different payment types - start counting from arrival time
    if (this.paymentType === 'deposit') {
      // Trial period - set trial end date from arrival
      if (this.trialInfo.isTrialPayment) {
        this.trialInfo.trialStartDate = now;
        this.trialInfo.trialEndDate = new Date(
          now.getTime() + this.trialInfo.trialDays * 24 * 60 * 60 * 1000
        );
      }
    } else if (
      this.paymentType === 'full' ||
      this.paymentType === 'remaining'
    ) {
      // Full payment - set full year end date from arrival
      this.endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    }

    return next();
  }
  next();
});
export default mongoose.model('Payment', paymentSchema);
