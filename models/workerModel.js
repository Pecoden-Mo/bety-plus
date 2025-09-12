import mongoose from 'mongoose';
import AppError from '../utils/appError.js';

const workerSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company is required'],
    index: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by user is required'],
    index: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
  },
  nationality: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  deposit: {
    type: Number,
    min: 0,
    // validate
    validate: {
      validator: function (v) {
        return v <= this.price;
      },
      message: 'Deposit should not exceed the price',
    },
  },
  maritalStatus: {
    type: String,
    required: true,
    enum: ['Single', 'Married', 'Divorced', 'Widowed'],
  },
  childrenNumber: {
    type: Number,
    required: true,
    min: 0,
  },
  religion: {
    type: String,
    required: true,
    enum: ['Islam', 'Christianity', 'Other'],
  },
  arrivalTime: {
    type: Date,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
    enum: [
      'cooking',
      'cleaning',
      'elderly care',
      'childcare',
      'shopping',
      'other Tasks',
    ],
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },

  yearsExperience: {
    type: Number,
    required: true,
    min: 0,
  },
  language: {
    type: [String],
    required: true,
    trim: true,
  },
  pictureWorker: {
    type: String,
    required: true,
  },
  introductoryVideo: String,
  availability: {
    type: String,
    required: true,
    enum: ['currently available', 'reserved', 'waiting for update'],
    default: 'currently available',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  isInside: {
    type: Boolean,
    required: true,
  },
  isDeleted: { type: Boolean, default: false },
});
workerSchema.index({ company: 1, status: 1 });
workerSchema.index({ company: 1, availability: 1 });
workerSchema.index({ nationality: 1 });
workerSchema.index({ skills: 1 });

workerSchema.pre('save', async function (next) {
  if (!this.isNew) return next();
  try {
    const company = await mongoose.model('Company').findById(this.company);
    if (!company) {
      return next(new AppError('Company not found', 404));
    }
    if (company.status !== 'approved') {
      return next(
        new AppError('Company must be approved before adding workers', 400)
      );
    }
    const UAE = [
      'Dubai',
      'Abu Dhabi',
      'Sharjah',
      'Ajman',
      'Ras Al Khaimah',
      'Fujairah',
      'Umm Al Quwain',
    ];
    if (UAE.includes(this.location)) {
      this.isInside = true;
    } else {
      this.isInside = false;
      this.deposit = 0;
    }
    next();
  } catch (error) {
    console.error(
      'Error checking company status ~ File:workerModel-110',
      error
    );
    return next(new AppError('Error checking company status', 500));
  }
});

export default mongoose.model('Worker', workerSchema, 'workers');
