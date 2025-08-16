import { check } from 'express-validator';
import validator from '../../middlewares/expressValidator.js';

const forgotPassword = [
  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false })
    .withMessage('Please provide a valid email address'),
  validator,
];

const resetPassword = [
  check('token').notEmpty().withMessage('Reset token is required'),

  check('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
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

const chengPassword = [
  check('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  check('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
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
const login = [
  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false })
    .withMessage('Please provide a valid email address'),
  check('password').notEmpty().withMessage('Password is required'),
  validator,
];

export default {
  forgotPassword,
  resetPassword,
  chengPassword,
  login,
};
