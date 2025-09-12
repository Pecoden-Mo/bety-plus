// import mongoose from 'mongoose';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import workerModel from '../../models/workerModel.js';
import NotificationService from '../../services/notificationService.js';

// Get all workers for admin management

export const getAllWorkers = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    status,
    availability,
    nationality,
    location,
    skills,
    search,
    companyId,
  } = req.query;

  const skip = (page - 1) * limit;

  // Build filter
  const filter = { isDeleted: false };

  if (status) filter.status = status;
  if (availability) filter.availability = availability;
  if (nationality) filter.nationality = nationality;
  if (location) filter.location = location;
  if (companyId) filter.company = companyId;
  if (skills) {
    filter.skills = { $in: skills.split(',') };
  }
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { nationality: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { skills: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  // Get workers with company information
  const workers = await workerModel
    .find(filter)
    .populate('company', 'companyName status')
    .populate('createdBy', 'email fullName')
    .select('-__v')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await workerModel.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      workers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Get single worker details
export const getWorker = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const worker = await workerModel
    .findById(id)
    .populate('company', 'companyName status user')
    .populate('createdBy', 'email fullName')
    .populate({
      path: 'company',
      populate: {
        path: 'user',
        select: 'email fullName phoneNumber',
      },
    });

  if (!worker) {
    return next(new AppError('Worker not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      worker,
    },
  });
});
// Get pending workers for approval
export const getPendingWorkers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const companies = await workerModel
    .find({ status: 'pending' })
    .populate('user', 'email ')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await workerModel.countDocuments({ status: 'pending' });

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
// Approve worker
export const approveWorker = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const adminId = req.user._id;

  const worker = await workerModel
    .findById(id)
    .populate('company', 'companyName user')
    .populate('createdBy', 'email fullName');

  if (!worker) {
    return next(new AppError('Worker not found', 404));
  }

  if (worker.status === 'approved') {
    return next(new AppError('Worker is already approved', 400));
  }

  // Check if company is approved
  if (worker.company.status !== 'approved') {
    return next(
      new AppError('Company must be approved before approving workers', 400)
    );
  }

  worker.status = 'approved';
  await worker.save();

  // Send notification to company
  await NotificationService.notifyWorkerApproval(worker, adminId);

  res.status(200).json({
    status: 'success',
    message: 'Worker approved successfully',
    data: {
      worker,
    },
  });
});

// Reject worker
export const rejectWorker = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;
  const adminId = req.user._id;

  const worker = await workerModel
    .findById(id)
    .populate('company', 'companyName user')
    .populate('createdBy', 'email fullName');

  if (!worker) {
    return next(new AppError('Worker not found', 404));
  }

  if (worker.status === 'rejected') {
    return next(new AppError('Worker is already rejected', 400));
  }

  worker.status = 'rejected';
  await worker.save();

  // Send notification to company with reason
  await NotificationService.notifyWorkerRejection(worker, adminId, reason);

  res.status(200).json({
    status: 'success',
    message: 'Worker rejected successfully',
    data: {
      worker,
    },
  });
});

// Update worker status (availability)
export const updateWorkerStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { availability } = req.body;

  if (
    !availability ||
    !['currently available', 'reserved', 'waiting for update'].includes(
      availability
    )
  ) {
    return next(new AppError('Valid availability status is required', 400));
  }

  const worker = await workerModel.findById(id);

  if (!worker) {
    return next(new AppError('Worker not found', 404));
  }

  worker.availability = availability;
  await worker.save();

  res.status(200).json({
    status: 'success',
    message: 'Worker status updated successfully',
    data: {
      worker,
    },
  });
});

// Get worker statistics for dashboard
export const getWorkerStats = catchAsync(async (req, res, next) => {
  const stats = await workerModel.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        approved: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        rejected: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] },
        },
        available: {
          $sum: {
            $cond: [{ $eq: ['$availability', 'currently available'] }, 1, 0],
          },
        },
        reserved: {
          $sum: { $cond: [{ $eq: ['$availability', 'reserved'] }, 1, 0] },
        },
      },
    },
  ]);

  const locationStats = await workerModel.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$location',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const nationalityStats = await workerModel.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$nationality',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const skillsStats = await workerModel.aggregate([
    { $match: { isDeleted: false } },
    { $unwind: '$skills' },
    {
      $group: {
        _id: '$skills',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overview: stats[0] || {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
        available: 0,
        reserved: 0,
      },
      byLocation: locationStats,
      byNationality: nationalityStats,
      bySkills: skillsStats,
    },
  });
});
