import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';
import userModel from '../../models/userModel.js';
//------------------------------------------------------------

// this route only for customer
// fullName  phoneNumber city area street only can updated
const update = catchAsync(async (req, res, next) => {
  const date = {};
  if (req.body.fullName) date.fullName = req.body.fullName;
  if (req.body.phoneNumber) date.phoneNumber = req.body.phoneNumber;
  if (req.body.city) date.city = req.body.city;
  if (req.body.area) date.area = req.body.area;
  if (req.body.street) date.street = req.body.street;
  if (req.body.image) date.image = req.body.image;

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
