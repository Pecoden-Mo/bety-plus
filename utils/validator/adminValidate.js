import { check } from 'express-validator';
import validator from '../../middlewares/expressValidator.js';

const register = [
  check('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 3 })
    .withMessage('Full name must be at least 3 characters long'),
  check('jobTitle').notEmpty().withMessage('Job title is required').trim(),
  check('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone('ar-EG')
    .withMessage('Please provide a valid phone number'),
  check('email')
    .toLowerCase()
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  check('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  validator,
];

export default {
  register,
};
