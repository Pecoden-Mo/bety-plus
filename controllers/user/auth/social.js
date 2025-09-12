// import AppError from '../../../utils/appError.js';
import catchAsync from '../../../utils/catchAsync.js';
import sendToken from '../../../utils/sendToken.js';

const authCallback = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return res.redirect(
      'http://localhost:5500/frontend/Sign-In-For-Client.html?error=auth_failed'
    );
  }
  const { user } = req;
  if (!user) {
    return res.redirect(
      'http://localhost:5500/frontend/Sign-In-For-Client.html?error=user_not_found'
    );
  }
  if (user.password) user.password = undefined;

  // Send token via cookie
  sendToken(user, res);

  // Redirect to frontend home page with success
  res.redirect('http://localhost:5500/frontend/index.html?auth=success');
});

export default authCallback;
