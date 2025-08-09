import catchAsync from '../../../utils/catchAsync.js';
const logout = catchAsync(async (req, res, next) => {
  // Clear the token cookie
  res.cookie('token', '', {
    expires: new Date(Date.now() - 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  // Respond with success message
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

export default logout;
