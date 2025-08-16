import { check } from 'express-validator';
import validator from '../../middlewares/expressValidator.js';

const register = [
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

const update = [
  check().custom((value, { req }) => {
    const allowed = [
      'fullName',
      'phoneNumber',
      'city',
      'area',
      'street',
      'image',
    ];
    const hasAny = allowed.some(
      (f) =>
        req.body[f] !== undefined && req.body[f] !== null && req.body[f] !== ''
    );
    if (!hasAny) {
      throw new Error('At least one field to update must be provided');
    }
    return true;
  }),
  check('fullName')
    .optional()
    .isString()
    .withMessage('Your name must be a string')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Your name must be between 2 and 100 characters'),
  check('phoneNumber')
    .optional()
    .isString()
    .withMessage('Your phone number must be a string')
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Your phone number must be between 7 and 20 characters'),
  check('city')
    .optional()
    .isString()
    .withMessage('city must be a string')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('city must be between 2 and 100 characters'),
  check('area')
    .optional()
    .isString()
    .withMessage('area must be a string')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('area must be between 2 and 100 characters'),
  check('street')
    .optional()
    .isString()
    .withMessage('street must be a string')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('street must be between 2 and 200 characters'),
  check('image')
    .optional()
    .isString()
    .withMessage('image must be a string')
    .trim(),
  validator,
];

export default {
  register,
  update,
};
