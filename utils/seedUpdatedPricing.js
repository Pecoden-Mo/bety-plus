import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PricingModel from '../models/pricingModel.js';

dotenv.config();

const seedSimplifiedPricing = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing pricing data
    await PricingModel.deleteMany({});

    // Create single global pricing configuration
    const globalPricing = new PricingModel({
      currency: 'AED', // Default currency
      fees: {
        serviceFee: 500, // Fixed service fee
        deliveryFee: 200, // Only for UAE workers
      },
      trialSettings: {
        trialDays: 4, // 4-day trial for UAE workers
      },
      isActive: true,
    });

    await globalPricing.save();

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
};

seedSimplifiedPricing();
