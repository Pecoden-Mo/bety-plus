import dotenv from 'dotenv';
import mongoose from 'mongoose';
import PricingModel from '../models/pricingModel.js';

dotenv.config({ path: '../.env' });

const seedPricing = async () => {
  try {
    console.log('Connecting to DB...', process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);

    const pricingData = {
      serviceType: 'housemaid',
      basePrice: 5250,
      currency: 'AED',
      fees: {
        guaranteeFee: 1500,
        serviceFee: 100,
        deliveryFee: 50,
      },
      locationMultiplier: new Map([
        ['Dubai', 1.2],
        ['Abu Dhabi', 1.15],
        ['Sharjah', 1.0],
        ['Ajman', 0.95],
        ['Other', 1.0],
      ]),
      experienceMultiplier: new Map([
        ['0-2', 1.0],
        ['3-5', 1.15],
        ['6-10', 1.3],
        ['10+', 1.5],
      ]),
      isActive: true,
    };

    await PricingModel.deleteMany({});
    const pricing = await PricingModel.create(pricingData);
    console.log(pricing);

    // process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedPricing();
