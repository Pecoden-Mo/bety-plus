import mongoose from 'mongoose';

const pricingSchema = new mongoose.Schema(
  {
    region: {
      type: String,
      required: true,
      enum: ['UAE', 'Outside_UAE'],
      unique: true,
      index: true,
    },
    currency: {
      type: String,
      default: 'AED',
      enum: ['AED', 'USD', 'SAR', 'KWD', 'QAR'],
    },
    fees: {
      serviceFee: {
        type: Number,
        default: 0,
      },
      deliveryFee: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Pricing', pricingSchema);
