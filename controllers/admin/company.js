import mongoose from 'mongoose';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import companyModel from '../../models/companyModel.js';
import workerModel from '../../models/workerModel.js';
import NotificationService from '../../services/notificationService.js';

// Approve company
export const approveCompany = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const adminId = req.user.id;

  // Find the company
  const company = await companyModel
    .findById(id)
    .populate('user', 'email fullName');

  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  if (company.status === 'approved') {
    return next(new AppError('Company is already processed', 400));
  }

  // Update company status
  company.status = 'approved';
  company.approvedBy = adminId;
  company.approvalDate = new Date();
  await company.save();

  // Send notification to company owner
  await NotificationService.notifyCompanyApproval(company, adminId);

  res.status(200).json({
    status: 'success',
    message: 'Company approved successfully',
    data: {
      company,
    },
  });
});

// Reject company
export const rejectCompany = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const adminId = req.user._id;

  // Find the company
  const company = await companyModel.findById(id).populate('user', 'email');

  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  if (company.status === 'rejected') {
    return next(new AppError('Company is already processed', 400));
  }

  // Update company status
  company.status = 'rejected';
  company.approvedBy = adminId;
  company.approvalDate = new Date();
  await company.save();

  // Send notification to company owner
  await NotificationService.notifyCompanyRejection(company, adminId);

  res.status(200).json({
    status: 'success',
    message: 'Company rejected successfully',
    data: {
      company,
    },
  });
});

// Get all pending companies
export const getPendingCompanies = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const companies = await companyModel
    .find({ status: 'pending' })
    .populate('user', 'email ')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await companyModel.countDocuments({ status: 'pending' });

  res.status(200).json({
    status: 'success',
    data: {
      companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Get all companies with their status
export const getAllCompanies = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, search } = req.query;
  const skip = (page - 1) * limit;

  const pipeline = [];

  // Add lookup to join with user data
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'user',
    },
  });

  // Unwind user array
  pipeline.push({
    $unwind: '$user',
  });

  // Add lookup to join with approvedBy admin data
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'approvedBy',
      foreignField: '_id',
      as: 'approvedBy',
    },
  });

  // Unwind approvedBy array (optional - only if approvedBy exists)
  pipeline.push({
    $unwind: {
      path: '$approvedBy',
      preserveNullAndEmptyArrays: true,
    },
  });

  // Build match filter
  const matchFilter = {};
  if (status) {
    matchFilter.status = status;
  }
  if (search) {
    matchFilter.$or = [
      { companyName: { $regex: search, $options: 'i' } },
      { commercialLicenseNumber: { $regex: search, $options: 'i' } },
      { licensingAuthority: { $regex: search, $options: 'i' } },
      { headOfficeAddress: { $regex: search, $options: 'i' } },
      { 'user.email': { $regex: search, $options: 'i' } },
    ];
  }

  pipeline.push({ $match: matchFilter });

  // Add sorting
  pipeline.push({ $sort: { createdAt: -1 } });

  // Get total count
  const totalPipeline = [...pipeline, { $count: 'total' }];
  const totalResult = await companyModel.aggregate(totalPipeline);
  const total = totalResult.length > 0 ? totalResult[0].total : 0;

  // Add pagination
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: parseInt(limit) });

  // Project only needed user fields
  pipeline.push({
    $project: {
      companyName: 1,
      commercialLicenseNumber: 1,
      licensingAuthority: 1,
      headOfficeAddress: 1,
      status: 1,
      approvalDate: 1,
      createdAt: 1,
      updatedAt: 1,
      'user._id': 1,
      'user.email': 1,
      'approvedBy._id': 1,
      'approvedBy.email': 1,
      'approvedBy.fullName': 1,
    },
  });

  const companies = await companyModel.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    data: {
      companies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

export const getCompany = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  console.log('get company id:', id);

  // Find the company with all related data
  const company = await companyModel
    .findById(id)
    .populate('user', 'email fullName phoneNumber address')
    .populate('approvedBy', 'email fullName');

  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  // Get company workers with pagination
  const {
    page = 1,
    limit = 10,
    status: workerStatus,
    availability,
  } = req.query;
  const skip = (page - 1) * limit;

  // Build worker filter
  const workerFilter = { company: id, isDeleted: false };
  if (workerStatus) {
    workerFilter.status = workerStatus;
  }
  if (availability) {
    workerFilter.availability = availability;
  }

  // Get workers with pagination
  const workers = await workerModel
    .find(workerFilter)
    .select('-__v')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Get total worker count
  const totalWorkers = await workerModel.countDocuments(workerFilter);

  // Get worker statistics
  const workerStats = await workerModel.aggregate([
    { $match: { company: new mongoose.Types.ObjectId(id), isDeleted: false } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const availabilityStats = await workerModel.aggregate([
    { $match: { company: new mongoose.Types.ObjectId(id), isDeleted: false } },
    {
      $group: {
        _id: '$availability',
        count: { $sum: 1 },
      },
    },
  ]);

  // Format statistics
  const stats = {
    total: totalWorkers,
    byStatus: workerStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byAvailability: availabilityStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
  };

  res.status(200).json({
    status: 'success',
    data: {
      company,
      workers,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalWorkers,
        pages: Math.ceil(totalWorkers / limit),
      },
    },
  });
});
