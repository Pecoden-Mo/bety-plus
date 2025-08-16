import { check } from 'express-validator';
import validator from '../../middlewares/expressValidator.js';

const registerValidator = [
  check('email')
    .toLowerCase()
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  check('companyName')
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 3 })
    .withMessage('Company name must be at least 3 characters long'),
  check('commercialLicenseNumber')
    .notEmpty()
    .withMessage('Commercial license number is required')
    .isLength({ min: 5 })
    .withMessage(
      'Commercial license number must be at least 5 characters long'
    ),
  check('commercialLicensePhoto').optional(), // for this time until we implement file upload
  check('licensingAuthority')
    .notEmpty()
    .withMessage('Licensing authority is required'),
  check('headOfficeAddress')
    .notEmpty()
    .withMessage('Head office address is required'),
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

const loginValidator = [
  check('email')
    .toLowerCase()
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),

  validator,
];

export default {
  registerValidator,
  loginValidator,
};
