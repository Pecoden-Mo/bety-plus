import mongoose from 'mongoose';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import companyModel from '../../models/companyModel.js';
import userModel from '../../models/userModel.js';
import workerModel from '../../models/workerModel.js';

export default catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const company = await companyModel.findOne({ user: userId });
  if (!company) {
    return next(new AppError('Company not found ', 404));
  }
  // TODO if worker are reserved do not allow deletion

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    await workerModel.deleteMany({ company: company._id }, { session });

    await companyModel.findByIdAndDelete(company._id, { session });

    await userModel.findByIdAndDelete(userId, { session });

    await session.commitTransaction();

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    await session.abortTransaction();
    return next(new AppError('Failed to delete company account', 500));
  } finally {
    session.endSession();
  }
});
