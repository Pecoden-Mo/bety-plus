import PricingModel from '../models/pricingModel.js';
import WorkerModel from '../models/workerModel.js';
import AppError from '../utils/appError.js';

class PricingService {
  static async calculatePrice(worker, serviceType = 'housemaid') {
    try {
      const pricing = await PricingModel.findOne({
        serviceType,
        isActive: true,
      });

      if (!pricing) {
        throw new AppError('Pricing not found for this service', 404);
      }

      let finalPrice = pricing.basePrice;
      const appliedMultipliers = {};

      // Location-based pricing
      const locationMultiplier =
        pricing.locationMultiplier.get(worker.currentLocation) || 1.0;
      finalPrice *= locationMultiplier;
      appliedMultipliers.location = locationMultiplier;

      // Experience-based pricing
      const experienceLevel = this.getExperienceLevel(worker.yearsExperience);
      const experienceMultiplier =
        pricing.experienceMultiplier.get(experienceLevel) || 1.0;
      finalPrice *= experienceMultiplier;
      appliedMultipliers.experience = experienceMultiplier;

      // Round to nearest dirham
      finalPrice = Math.round(finalPrice);

      const pricingBreakdown = {
        basePrice: finalPrice,
        guaranteeFee: pricing.fees.guaranteeFee,
        serviceFee: pricing.fees.serviceFee,
        deliveryFee: pricing.fees.deliveryFee,
        totalAmount:
          finalPrice +
          pricing.fees.guaranteeFee +
          pricing.fees.serviceFee +
          pricing.fees.deliveryFee,
        currency: pricing.currency,
        appliedMultipliers,
      };

      return pricingBreakdown;
    } catch (error) {
      throw new AppError(`Pricing calculation failed: ${error.message}`, 400);
    }
  }

  static getExperienceLevel(years) {
    if (years <= 2) return '0-2';
    if (years <= 5) return '3-5';
    if (years <= 10) return '6-10';
    return '10+';
  }

  static async getPricingQuote(workerId) {
    const worker = await WorkerModel.findById(workerId).populate(
      'company',
      'companyName'
    );

    if (!worker) {
      throw new AppError('Worker not found', 404);
    }

    const pricing = await this.calculatePrice(worker);

    return {
      worker: {
        id: worker._id,
        name: worker.fullName,
        company: worker.company.companyName,
        location: worker.currentLocation,
        experience: worker.yearsExperience,
        skills: worker.skills,
      },
      pricing,
    };
  }
}

export default PricingService;
