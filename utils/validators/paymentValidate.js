import { body, param } from 'express-validator';
import validator from '../../middleware/expressValidator.js';

const paymentValidate = {
  create: [
    body('workerId').isMongoId().withMessage('Invalid worker ID'),

    body('paymentType')
      .optional()
      .isIn(['deposit', 'full', 'remaining'])
      .withMessage('Invalid payment type. Must be deposit, full, or remaining'),

    body('depositPaymentId')
      .optional()
      .isMongoId()
      .withMessage('Invalid deposit payment ID'),

    // Validate that depositPaymentId is required for remaining payments
    body('depositPaymentId').custom((value, { req }) => {
      if (req.body.paymentType === 'remaining' && !value) {
        throw new Error(
          'Deposit payment ID is required for remaining payments'
        );
      }
      return true;
    }),

    validator,
  ],

  remainingPayment: [
    param('depositPaymentId')
      .isMongoId()
      .withMessage('Invalid deposit payment ID'),

    validator,
  ],

  success: [
    body('session_id').notEmpty().withMessage('Session ID is required'),

    validator,
  ],
};

export default paymentValidate;
