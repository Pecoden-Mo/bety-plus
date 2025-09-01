import { body } from 'express-validator';
import validator from '../../middleware/expressValidator.js';

const paymentValidate = {
  create: [
    body('workerId').isMongoId().withMessage('Invalid worker ID'),

    body('serviceType')
      .optional()
      .isIn(['housemaid', 'nanny', 'elderly_care', 'cook', 'cleaner', 'driver'])
      .withMessage('Invalid service type'),

    validator,
  ],

  success: [
    body('session_id').notEmpty().withMessage('Session ID is required'),

    validator,
  ],
};

export default paymentValidate;
