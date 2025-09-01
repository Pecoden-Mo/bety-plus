import { validationResult } from 'express-validator';
import AppError from '../utils/appError.js';

// send error by appError

const validator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0].msg;

    return next(new AppError(firstError, 400));
  }
  next();
};

export default validator;
