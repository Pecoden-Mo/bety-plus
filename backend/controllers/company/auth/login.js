import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import companyModel from '../../../models/companyModel.js';
import sendToken from '../../../utils/sendToken.js';

const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const company = await companyModel.findOne({ email }).select('+password');
  console.log(company);

  if (
    !company ||
    !(await company.correctPassword(password, company.password))
  ) {
    return next(new AppError('Incorrect email or password', 401));
  }
  sendToken(company, res);
  res.status(200).json({
    status: 'success',
    data: {
      company,
    },
  });
});
export default login;
