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

  // Calculate trial price (4 days deposit for inside UAE workers)
  static async calculateTrialPrice(worker, serviceType) {
    const basePricing = await this.calculatePrice(worker, serviceType);

    // Use worker's custom price if available, otherwise use pricing model
    const baseAmount = worker.price || basePricing.totalFees || 1000; // Default fallback

    // Trial is 4 days worth of payment (annual amount / 365 * 4)
    const trialAmount = Math.round((baseAmount / 365) * 4);

    return Object.assign({}, basePricing, {
      totalAmount: trialAmount,
      originalAmount: baseAmount,
      trialDays: 4,
      paymentType: 'deposit',
      description: `4-day trial deposit for ${serviceType}`,
    });
  }

  // Calculate full year price
  static async calculateFullPrice(worker, serviceType) {
    const pricing = await this.calculatePrice(worker, serviceType);

    // Use worker's custom price if available
    const totalAmount = worker.price || pricing.totalFees || 1000; // Default fallback

    return Object.assign({}, pricing, {
      totalAmount,
      paymentType: 'full',
      description: `Full year booking for ${serviceType}`,
    });
  }

  // Calculate remaining amount after trial
  static async calculateRemainingPrice(worker, serviceType, depositPaid) {
    const fullPricing = await this.calculateFullPrice(worker, serviceType);
    const remainingAmount = fullPricing.totalAmount - depositPaid;

    return Object.assign({}, fullPricing, {
      totalAmount: remainingAmount,
      depositPaid,
      paymentType: 'remaining',
      description: `Remaining payment after trial for ${serviceType}`,
    });
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
