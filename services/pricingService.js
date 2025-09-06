/* eslint-disable prefer-object-spread */
import PricingModel from '../models/pricingModel.js';
import WorkerModel from '../models/workerModel.js';
import AppError from '../utils/appError.js';

class PricingService {
  static async calculatePrice(worker) {
    try {
      // Get global pricing settings
      const region = worker.isInside ? 'UAE' : 'Outside_UAE';
      const pricing = await PricingModel.findOne({
        isActive: true,
        region,
      });

      if (!pricing) {
        throw new AppError('Pricing configuration not found', 404);
      }

      // Use worker's price as base price (required field in worker model)
      const basePrice = worker.price;

      if (!basePrice || basePrice <= 0) {
        throw new AppError('Worker price not set', 400);
      }

      // Calculate fees
      const serviceFee = pricing.fees.serviceFee || 0;
      const deliveryFee = pricing.fees.deliveryFee || 0;

      const totalAmount = basePrice + serviceFee + deliveryFee;

      const pricingBreakdown = {
        isInside: worker.isInside,
        deposit: worker.deposit,
        basePrice,
        serviceFee,
        deliveryFee,
        totalAmount,
        currency: pricing.currency,
        workerLocation: worker.location,
        canHaveTrial: worker.isInside,
        trialDays: pricing.trialSettings.trialDays || 0,
      };

      return pricingBreakdown;
    } catch (error) {
      throw new AppError(`Pricing calculation failed: ${error.message}`, 400);
    }
  }

  static async getPricingQuote(workerId) {
    const worker = await WorkerModel.findById(workerId);

    if (!worker) {
      throw new AppError('Worker not found', 404);
    }

    const pricing = await this.calculatePrice(worker);

    // For UAE workers, provide both trial and full payment options
    const paymentOptions = {};

    if (pricing.canHaveTrial) {
      // Use worker's deposit as trial amount
      const trialAmount = worker.deposit;

      paymentOptions.trial = {
        amount: trialAmount,
        type: 'deposit',
        description: `${pricing.trialDays}-day trial deposit`,
        trialDays: pricing.trialDays,
        originalFullAmount: pricing.totalAmount,
      };

      paymentOptions.full = {
        amount: pricing.totalAmount,
        type: 'full',
        description: 'Full year payment',
      };
    } else {
      // Outside UAE - only full payment
      paymentOptions.full = {
        amount: pricing.totalAmount,
        type: 'full',
        description: 'Full year payment (required for outside UAE workers)',
      };
    }

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
      paymentOptions,
    };
  }

  // Calculate trial price (uses worker's deposit field)
  static async calculateTrialPrice(worker) {
    const basePricing = await this.calculatePrice(worker);

    if (!basePricing.canHaveTrial) {
      throw new AppError('Trial not available for this worker', 400);
    }

    // Use worker's deposit field as trial amount
    const trialAmount = worker.deposit;

    return Object.assign({}, basePricing, {
      totalAmount: trialAmount,
      originalAmount: basePricing.totalAmount,
      trialDays: basePricing.trialDays,
      paymentType: 'deposit',
      description: `${basePricing.trialDays}-day trial deposit`,
    });
  }

  // Calculate full year price
  static async calculateFullPrice(worker) {
    const pricing = await this.calculatePrice(worker);

    return Object.assign({}, pricing, {
      paymentType: 'full',
      description: 'Full year booking',
    });
  }

  // Calculate remaining amount after trial
  static async calculateRemainingPrice(worker, depositPaid) {
    const fullPricing = await this.calculateFullPrice(worker);
    const remainingAmount = fullPricing.totalAmount - depositPaid;

    return Object.assign({}, fullPricing, {
      totalAmount: remainingAmount,
      depositPaid,
      paymentType: 'remaining',
      description: 'Remaining payment after trial',
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
    const pricing = await PricingModel.findOne({
      isActive: true,
    });

    return {
      worker: {
        location: worker.location,
        isInside: worker.isInside,
        price: worker.price,
      },
      pricingExists: !!pricing,
      pricing: pricing
        ? {
            serviceFee: pricing.fees.serviceFee || 0,
            deliveryFee: pricing.fees.deliveryFee || 0,
            currency: pricing.currency,
          }
        : null,
    };
  }
}

export default PricingService;
