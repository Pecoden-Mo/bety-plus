import { body, param, query } from 'express-validator';
import validator from '../../middleware/expressValidator.js';

// Validation for creating pricing
export const createPricingValidation = [
  body('region')
    .isIn(['UAE', 'Outside_UAE'])
    .withMessage('Region must be either UAE or Outside_UAE'),

  body('currency')
    .optional()
    .isIn(['AED', 'USD', 'SAR', 'KWD', 'QAR'])
    .withMessage('Currency must be one of: AED, USD, SAR, KWD, QAR'),

  body('serviceFee')
    .optional()
    .isNumeric()
    .withMessage('Service fee must be a number')
    .isFloat({ min: 0 })
    .withMessage('Service fee must be 0 or greater'),

  body('deliveryFee')
    .optional()
    .isNumeric()
    .withMessage('Delivery fee must be a number')
    .isFloat({ min: 0 })
    .withMessage('Delivery fee must be 0 or greater'),

  validator,
];

// Validation for updating pricing
export const updatePricingValidation = [
  param('id').isMongoId().withMessage('Invalid pricing ID'),

  body('currency')
    .optional()
    .isIn(['AED', 'USD', 'SAR', 'KWD', 'QAR'])
    .withMessage('Currency must be one of: AED, USD, SAR, KWD, QAR'),

  body('serviceFee')
    .optional()
    .isNumeric()
    .withMessage('Service fee must be a number')
    .isFloat({ min: 0 })
    .withMessage('Service fee must be 0 or greater'),

  body('deliveryFee')
    .optional()
    .isNumeric()
    .withMessage('Delivery fee must be a number')
    .isFloat({ min: 0 })
    .withMessage('Delivery fee must be 0 or greater'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validator,
];

// Validation for getting pricing by ID
export const getPricingValidation = [
  param('id').isMongoId().withMessage('Invalid pricing ID'),
  validator,
];

// Validation for getting pricing by region
export const getPricingByRegionValidation = [
  param('region')
    .isIn(['UAE', 'Outside_UAE'])
    .withMessage('Region must be either UAE or Outside_UAE'),
  validator,
];

// Validation for query parameters
export const getAllPricingValidation = [
  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive must be true or false'),

  query('region')
    .optional()
    .isIn(['UAE', 'Outside_UAE'])
    .withMessage('Region must be either UAE or Outside_UAE'),
  validator,
];
