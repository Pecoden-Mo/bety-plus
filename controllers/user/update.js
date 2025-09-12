import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';
import userModel from '../../models/userModel.js';
//------------------------------------------------------------

// this route only for customer
// All new user fields can be updated
const update = catchAsync(async (req, res, next) => {
  const date = {};
  if (req.body.fullName) date.fullName = req.body.fullName;

  // Handle phone numbers as array
  if (req.body.phoneNumber) {
    // If phoneNumber is provided as array, use it directly
    if (Array.isArray(req.body.phoneNumber)) {
      date.phoneNumber = req.body.phoneNumber.filter(
        (phone) => phone && phone.trim() !== ''
      );
    } else if (typeof req.body.phoneNumber === 'string') {
      // If phoneNumber is provided as string, convert to array
      date.phoneNumber = [req.body.phoneNumber.trim()];
    }
  }

  if (req.body.city) date.city = req.body.city;
  if (req.body.area) date.area = req.body.area;
  if (req.body.street) date.street = req.body.street;
  if (req.body.image) date.image = req.body.image;
  if (req.body.nationality) date.nationality = req.body.nationality;
  if (req.body.houseNumber) date.houseNumber = req.body.houseNumber;
  if (req.body.passportImage) date.passportImage = req.body.passportImage;

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
