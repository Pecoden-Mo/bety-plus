import { check } from 'express-validator';

import validator from '../../middleware/expressValidator.js';

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

  validator,
];

const update = [
  check().custom((value, { req }) => {
    const allowed = [
      'fullName',
      'phoneNumber',
      'primaryPhone', // Keep for backward compatibility
      'secondaryPhone', // Keep for backward compatibility
      'city',
      'area',
      'street',
      'image',
      'nationality',
      'houseNumber',
      'passportImage',
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
    .custom((value) => {
      if (Array.isArray(value)) {
        // If it's an array, validate each phone number
        for (const phone of value) {
          if (typeof phone !== 'string' || phone.trim().length < 7 || phone.trim().length > 20) {
            throw new Error('Each phone number must be a string between 7 and 20 characters');
          }
        }
        return true;
      } else if (typeof value === 'string') {
        // If it's a string, validate as single phone number
        if (value.trim().length < 7 || value.trim().length > 20) {
          throw new Error('Phone number must be between 7 and 20 characters');
        }
        return true;
      } else {
        throw new Error('Phone number must be a string or array of strings');
      }
    }),
  check('primaryPhone')
    .optional()
    .isString()
    .withMessage('Primary phone number must be a string')
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Primary phone number must be between 7 and 20 characters'),
  check('secondaryPhone')
    .optional()
    .isString()
    .withMessage('Secondary phone number must be a string')
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Secondary phone number must be between 7 and 20 characters'),
  check('nationality')
    .optional()
    .isString()
    .withMessage('Nationality must be a string')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nationality must be between 2 and 50 characters'),
  check('houseNumber')
    .optional()
    .isString()
    .withMessage('House number must be a string')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('House number must be between 1 and 20 characters'),
  check('passportImage')
    .optional()
    .isString()
    .withMessage('Passport image must be a string')
    .trim(),
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
