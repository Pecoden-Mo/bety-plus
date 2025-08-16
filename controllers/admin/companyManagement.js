import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import companyModel from '../../models/companyModel.js';
import NotificationService from '../../utils/notificationService.js';

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

  if (company.status !== 'pending') {
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
  const company = await companyModel
    .findById(id)
    .populate('user', 'email fullName');

  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  if (company.status !== 'pending') {
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
    .populate('user', 'email fullName')
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
  const { page = 1, limit = 10, status } = req.query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (status) {
    filter.status = status;
  }

  const companies = await companyModel
    .find(filter)
    .populate('user', 'email fullName')
    .populate('approvedBy', 'email fullName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await companyModel.countDocuments(filter);

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
