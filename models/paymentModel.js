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
      guaranteeFee: Number,
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
    status: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    serviceMode: {
      type: String,
      enum: ['booking', 'purchase'],
      required: [true, 'Service mode is required'],
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
// after update payment status to succeeded set endDate for worker after 7 days if worker is from UAE
// after update payment status to succeeded set endDate for worker after 1 year if worker is from Outside_UAE
paymentSchema.pre('save', async function (next) {
  if (this.isModified('status') && this.status === 'succeeded') {
    const now = new Date();
    if (this.serviceMode === 'booking') {
      // UAE worker - 7 days
      this.endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (this.serviceMode === 'purchase') {
      this.endDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    }
    return next();
  }
});
export default mongoose.model('Payment', paymentSchema);
