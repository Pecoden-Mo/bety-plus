import AppError from '../utils/appError.js';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Company from '../models/companyModel.js';
import catchAsync from '../utils/catchAsync.js';
