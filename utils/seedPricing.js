import dotenv from 'dotenv';
import mongoose from 'mongoose';
import PricingModel from '../models/pricingModel.js';

dotenv.config({ path: '../.env' });

const seedPricingByRegion = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear existing pricing data
    await PricingModel.deleteMany({});

    // Simple pricing data - one price per region
    const pricingData = [
      {
        region: 'UAE',
        currency: 'AED',
        fees: {
          serviceFee: 100,
          deliveryFee: 50,
        },
        isActive: true,
      },
      {
        region: 'Outside_UAE',
        currency: 'AED',
        fees: {
          serviceFee: 80,
          deliveryFee: 0,
        },
        isActive: true,
      },
    ];

    // Insert pricing data
    const createdPricing = await PricingModel.insertMany(pricingData);
    console.log(`✅ Created ${createdPricing.length} pricing records`);

    // Display created records
    createdPricing.forEach((pricing) => {
      console.log(
        `${pricing.region}: ${pricing.basePrice} ${pricing.currency}`
      );
    });

    console.log('✅ Pricing data seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding pricing:', error);
    process.exit(1);
  }
};

seedPricingByRegion();
