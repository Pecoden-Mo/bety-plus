import mongoose from 'mongoose';
import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import companyModel from '../../models/companyModel.js';
import userModel from '../../models/userModel.js';
import workerModel from '../../models/workerModel.js';

export default catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // Find the company first
  const company = await companyModel.findOne({ user: userId });
  if (!company) {
    return next(new AppError('Company not found for this user', 404));
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Delete all workers associated with this company
    await workerModel.deleteMany({ company: company._id }, { session });

    // Delete the company
    await companyModel.findByIdAndDelete(company._id, { session });

    // Delete the user account
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
