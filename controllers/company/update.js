import catchAsync from '../../utils/catchAsync.js';
import AppError from '../../utils/appError.js';
import companyModel from '../../models/companyModel.js';
import NotificationService from '../../services/notificationService.js';
import userModel from '../../models/userModel.js';

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
  // If commercialLicensePhoto is being updated, set status to 'pending'
  let message = 'Company updated successfully';
  if (updateData.commercialLicensePhoto) {
    updateData.status = 'pending';
    message = 'Company updated successfully and is pending re-approval';
  }
  const company = await companyModel
    .findOneAndUpdate({ user: userId }, updateData, {
      new: true,
      runValidators: true,
    })
    .select('-approvedBy -approvalDate   -updatedAt -__v')
    .populate('user', 'email fullName image');
  await userModel.findOneAndUpdate(
    { _id: userId },
    { fullName: updateData.companyName, image: updateData.image },
    { new: true, runValidators: true }
  );

  if (!company) {
    return next(new AppError('Company not found for this user', 404));
  }
  try {
    await NotificationService.notifyCompanyUpdate(company);
  } catch (notificationError) {
    console.error('Failed to send notification:', notificationError);
  }

  res.status(200).json({
    status: 'success',
    message,
    data: {
      company,
    },
  });
});
