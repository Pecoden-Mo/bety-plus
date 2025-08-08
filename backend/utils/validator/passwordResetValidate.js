import validator from '../../middlewares/expressValidator.js';
import { body, check } from 'express-validator';

const forgotPassword = [
  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  validator,
];

const resetPassword = [
  check('token').notEmpty().withMessage('Reset token is required'),

  check('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  check('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your password')
    .custom((val, { req }) => {
      if (val !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  validator,
];

export default {
  forgotPassword,
  resetPassword,
};
