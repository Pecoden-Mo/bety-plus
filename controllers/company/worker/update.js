import catchAsync from '../../../utils/catchAsync.js';
import AppError from '../../../utils/appError.js';
import workerModel from '../../../models/workerModel.js';
import companyModel from '../../../models/companyModel.js';

export default catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const company = await companyModel.findOne({ user: userId });
  if (!company) {
    return next(new AppError('Company not found for this user', 404));
  }

  const data = {
    fullName: req.body.fullName,
    age: req.body.age,
    nationality: req.body.nationality,
    maritalStatus: req.body.maritalStatus,
    childrenNumber: req.body.childrenNumber,
    religion: req.body.religion,
    arrivalTime: req.body.arrivalTime,
    skills: req.body.skills,
    yearsExperience: req.body.yearsExperience,
    language: req.body.language,
    pictureWorker: req.body.pictureWorker,
    introductoryVideo: req.body.introductoryVideo,
    availability: req.body.availability,
    status: req.body.status,
  };

  // Filter out undefined values to only update provided fields
  const updateData = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
      updateData[key] = data[key];
    }
  });

  const worker = await workerModel
    .findOneAndUpdate({ _id: id, company: company._id }, updateData, {
      new: true,
      runValidators: true,
    })
    .populate('company', 'companyName')
    .populate('createdBy', 'email');

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
// TODO
// Add validation for the request body to ensure required fields are present
