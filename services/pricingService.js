import PricingModel from '../models/pricingModel.js';
import WorkerModel from '../models/workerModel.js';
import AppError from '../utils/appError.js';

class PricingService {
  // Helper method to determine region based on worker's isInside property
  static getRegion(isInside) {
    return isInside ? 'UAE' : 'Outside_UAE';
  }

  static async calculatePrice(worker) {
    try {
      const region = this.getRegion(worker.isInside);

      const pricing = await PricingModel.findOne({
        region,
        isActive: true,
      });

      if (!pricing) {
        throw new AppError(`Pricing not found for region: ${region}`, 404);
      }

      // Calculate total fees based on region
      let totalFees = pricing.fees.serviceFee || 0;

      // Add delivery fee only for UAE workers
      if (worker.isInside) {
        totalFees += pricing.fees.deliveryFee || 0;
      }

      const pricingBreakdown = {
        region,
        isInside: worker.isInside,
        serviceFee: pricing.fees.serviceFee || 0,
        deliveryFee: worker.isInside ? pricing.fees.deliveryFee || 0 : 0,
        totalFees,
        currency: pricing.currency,
        workerLocation: worker.location,
      };

      return pricingBreakdown;
    } catch (error) {
      throw new AppError(`Pricing calculation failed: ${error.message}`, 400);
    }
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
        location: worker.location,
        isInside: worker.isInside,
        experience: worker.yearsExperience,
        skills: worker.skills,
      },
      pricing,
    };
  }

  // Helper method to get all active pricing
  static async getAllPricing() {
    try {
      return await PricingModel.find({ isActive: true });
    } catch (error) {
      throw new AppError(`Error fetching pricing: ${error.message}`, 400);
    }
  }

  // Helper method to validate worker pricing setup
  static async validateWorkerPricing(worker) {
    const region = this.getRegion(worker.isInside);
    const pricing = await PricingModel.findOne({
      region,
      isActive: true,
    });

    return {
      worker: {
        location: worker.location,
        isInside: worker.isInside,
        determinedRegion: region,
      },
      pricingExists: !!pricing,
      pricing: pricing
        ? {
            basePrice: pricing.basePrice,
            totalFees:
              (pricing.fees.guaranteeFee || 0) +
              (pricing.fees.serviceFee || 0) +
              (pricing.fees.deliveryFee || 0),
            currency: pricing.currency,
          }
        : null,
    };
  }
}

export default PricingService;
