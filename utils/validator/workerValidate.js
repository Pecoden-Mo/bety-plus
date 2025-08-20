import { check } from 'express-validator';
import validator from '../../middlewares/expressValidator.js';

const create = [
  check('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isString()
    .withMessage('Full name must be a string')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  check('age').notEmpty().withMessage('Age is required'),

  check('nationality')
    .notEmpty()
    .withMessage('Nationality is required')
    .isString()
    .withMessage('Nationality must be a string')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nationality must be between 2 and 50 characters'),

  check('maritalStatus')
    .notEmpty()
    .withMessage('Marital status is required')
    .isIn(['Single', 'Married', 'Divorced', 'Widowed'])
    .withMessage(
      'Marital status must be Single, Married, Divorced, or Widowed'
    ),

  check('childrenNumber')
    .notEmpty()
    .withMessage('Number of children is required')
    .isInt({ min: 0 })
    .withMessage('Number of children must be 0 or greater'),

  check('religion')
    .notEmpty()
    .withMessage('Religion is required')
    .isString()
    .withMessage('Religion must be a string')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Religion must be between 2 and 50 characters'),

  check('arrivalTime')
    .notEmpty()
    .withMessage('Arrival time is required')
    .isISO8601()
    .withMessage('Arrival time must be a valid date'),

  check('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required')
    .custom((skills) => {
      const allowedSkills = [
        'cooking',
        'cleaning',
        'elderly care',
        'childcare',
        'shopping',
        'other Tasks',
      ];
      const invalidSkills = skills.filter(
        (skill) => !allowedSkills.includes(skill)
      );
      if (invalidSkills.length > 0) {
        throw new Error(`Invalid skills: ${invalidSkills.join(', ')}`);
      }
      return true;
    }),

  check('yearsExperience')
    .notEmpty()
    .withMessage('Years of experience is required')
    .isInt({ min: 0 })
    .withMessage('Years of experience must be 0 or greater'),

  check('language')
    .isArray({ min: 1 })
    .withMessage('At least one language is required')
    .custom((languages) => {
      if (
        languages.some(
          (lang) => typeof lang !== 'string' || lang.trim().length < 2
        )
      ) {
        throw new Error(
          'Each language must be a valid string with at least 2 characters'
        );
      }
      return true;
    }),

  check('availability')
    .notEmpty()
    .withMessage('Availability is required')
    .isIn(['currently available', 'reserved', 'waiting for update'])
    .withMessage(
      'Availability must be: currently available, reserved, or waiting for update'
    ),

  check('pictureWorker')
    .optional()
    .isString()
    .withMessage('Picture must be a string'),

  check('introductoryVideo')
    .optional()
    .isString()
    .withMessage('Introductory video must be a string'),

  validator,
];

const update = [
  check().custom((value, { req }) => {
    const allowed = [
      'fullName',
      'age',
      'nationality',
      'maritalStatus',
      'ChildrenNumber',
      'religion',
      'arrivalTime',
      'skills',
      'yearsExperience',
      'language',
      'pictureWorker',
      'introductoryVideo',
      'Availability',
    ];
    const hasAny = allowed.some(
      (field) =>
        req.body[field] !== undefined &&
        req.body[field] !== null &&
        req.body[field] !== ''
    );
    if (!hasAny) {
      throw new Error('At least one field to update must be provided');
    }
    return true;
  }),

  check('fullName')
    .optional()
    .isString()
    .withMessage('Full name must be a string')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  check('age').optional(),

  check('nationality')
    .optional()
    .isString()
    .withMessage('Nationality must be a string')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nationality must be between 2 and 50 characters'),

  check('maritalStatus')
    .optional()
    .isIn(['Single', 'Married', 'Divorced', 'Widowed'])
    .withMessage(
      'Marital status must be Single, Married, Divorced, or Widowed'
    ),

  check('childrenNumber')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Number of children must be 0 or greater'),

  check('religion')
    .optional()
    .isString()
    .withMessage('Religion must be a string')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Religion must be between 2 and 50 characters'),

  check('arrivalTime')
    .optional()
    .isISO8601()
    .withMessage('Arrival time must be a valid date'),

  check('skills')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one skill is required if updating skills')
    .custom((skills) => {
      const allowedSkills = [
        'cooking',
        'cleaning',
        'elderly care',
        'childcare',
        'shopping',
        'other Tasks',
      ];
      const invalidSkills = skills.filter(
        (skill) => !allowedSkills.includes(skill)
      );
      if (invalidSkills.length > 0) {
        throw new Error(`Invalid skills: ${invalidSkills.join(', ')}`);
      }
      return true;
    }),

  check('yearsExperience')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Years of experience must be 0 or greater'),

  check('language')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one language is required if updating languages')
    .custom((languages) => {
      if (
        languages.some(
          (lang) => typeof lang !== 'string' || lang.trim().length < 2
        )
      ) {
        throw new Error(
          'Each language must be a valid string with at least 2 characters'
        );
      }
      return true;
    }),

  check('availability')
    .optional()
    .isIn(['currently available', 'reserved', 'waiting for update'])
    .withMessage(
      'Availability must be: currently available, reserved, or waiting for update'
    ),

  check('pictureWorker')
    .optional()
    .isString()
    .withMessage('Picture must be a string'),

  check('introductoryVideo')
    .optional()
    .isString()
    .withMessage('Introductory video must be a string'),

  validator,
];

export default {
  create,
  update,
};
