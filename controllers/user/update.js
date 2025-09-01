import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';
import userModel from '../../models/userModel.js';
//------------------------------------------------------------

// this route only for customer
// All new user fields can be updated
const update = catchAsync(async (req, res, next) => {
  const date = {};
  if (req.body.fullName) date.fullName = req.body.fullName;
  if (req.body.primaryPhone) date.primaryPhone = req.body.primaryPhone;
  if (req.body.secondaryPhone) date.secondaryPhone = req.body.secondaryPhone;
  if (req.body.city) date.city = req.body.city;
  if (req.body.area) date.area = req.body.area;
  if (req.body.street) date.street = req.body.street;
  if (req.body.image) date.image = req.body.image;
  if (req.body.nationality) date.nationality = req.body.nationality;
  if (req.body.emirate) date.emirate = req.body.emirate;
  if (req.body.houseNumber) date.houseNumber = req.body.houseNumber;
  if (req.body.apartmentNumber) date.apartmentNumber = req.body.apartmentNumber;
  if (req.body.idPassportImage) date.idPassportImage = req.body.idPassportImage;

  const user = await userModel.findOneAndUpdate(
    { _id: req.user.id, role: 'customer' },
    date,
    { new: true, runValidators: true }
  );
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export default update;
