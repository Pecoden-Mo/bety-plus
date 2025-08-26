import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import companyModel from '../../models/companyModel.js';

export default catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const data = {
    companyName: req.body.companyName,
    commercialLicenseNumber: req.body.commercialLicenseNumber,
    commercialLicensePhoto: req.body.commercialLicensePhoto,
    licensingAuthority: req.body.licensingAuthority,
    headOfficeAddress: req.body.headOfficeAddress,
    image: req.body.image,
  };

  const updateData = {};
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null && data[key] !== '') {
      updateData[key] = data[key];
    }
  });

  const company = await companyModel
    .findOneAndUpdate({ user: userId }, updateData, {
      new: true,
      runValidators: true,
    })
    .populate('user', 'email fullName')
    .populate('approvedBy', 'email fullName');

  if (!company) {
    return next(new AppError('Company not found for this user', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      company,
    },
  });
});
