import mongoose from 'mongoose';

const pricingSchema = new mongoose.Schema(
  {
    serviceType: {
      type: String,
      required: true,
      enum: ['housemaid', 'nanny', 'elderly_care', 'cook', 'cleaner', 'driver'],
      index: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'AED',
      enum: ['AED', 'USD', 'SAR', 'KWD', 'QAR'],
    },
    fees: {
      guaranteeFee: {
        type: Number,
        default: 1500,
      },
      serviceFee: {
        type: Number,
        default: 100,
      },
      deliveryFee: {
        type: Number,
        default: 50,
      },
    },
    locationMultiplier: {
      type: Map,
      of: Number,
      default: {
        Dubai: 1.2,
        'Abu Dhabi': 1.15,
        Sharjah: 1.0,
        Ajman: 0.95,
        Other: 1.0,
      },
    },
    experienceMultiplier: {
      type: Map,
      of: Number,
      default: {
        '0-2': 1.0,
        '3-5': 1.15,
        '6-10': 1.3,
        '10+': 1.5,
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
