import express from 'express';
import auth from '../../controllers/auth/index.js';
import validator from '../../utils/validators/passwordValidate.js';
import { isAuthenticated } from '../../middleware/authMiddleware.js';

const router = express.Router();
router.post('/login', validator.login, auth.login);
// register will be separated
router.post('/forgot-password', validator.forgotPassword, auth.forgotPassword);
router.post('/reset-password', validator.resetPassword, auth.resetPassword);
router.post(
  '/change-password',
  isAuthenticated,
  validator.chengPassword,
  auth.changePassword
);
router.post('/logout', auth.logout);

export default router;
// we can make this route for all auth as /auth/user/register  and make unified auth route here
