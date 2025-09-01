import catchAsync from '../../../utils/catchAsync.js';
import workerModel from '../../../models/workerModel.js';
import companyModel from '../../../models/companyModel.js';
import AppError from '../../../utils/appError.js';

export default catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search } = req.query;
  const skip = (page - 1) * limit;
  const user = req.user.id;
  const company = await companyModel.findOne({ user });

  if (!company) {
    return next(new AppError('Company not found', 404));
  }

  const filter = { company: company._id };
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { nationality: { $regex: search, $options: 'i' } },
      { religion: { $regex: search, $options: 'i' } },
    ];
  }

  const workers = await workerModel
    .find(filter)
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
