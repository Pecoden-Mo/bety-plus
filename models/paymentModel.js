import mongoose from 'mongoose';

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
      appliedMultipliers: {
        location: Number,
        experience: Number,
      },
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
    serviceType: {
      type: String,
      enum: ['housemaid', 'nanny', 'elderly_care', 'cook', 'cleaner', 'driver'],
      default: 'housemaid',
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
  },
  { timestamps: true }
);

paymentSchema.index({ user: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });

export default mongoose.model('Payment', paymentSchema);
