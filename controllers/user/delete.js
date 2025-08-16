import AppError from '../../utils/appError.js';
import catchAsync from '../../utils/catchAsync.js';
import userModel from '../../models/userModel.js';
//------------------------------------------------------------

// this route only for customer
// fullName  phoneNumber city area street only can updated
const deleteMe = catchAsync(async (req, res, next) => {
  const user = await userModel.findOneAndDelete({
    _id: req.user.id,
    role: 'customer',
  });
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.clearCookie('token');
  res.status(200).json({
    status: 'success',
    data: {
      user: null,
    },
  });
});

export default deleteMe;
