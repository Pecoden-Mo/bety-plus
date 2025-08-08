import express from 'express';
import auth from '../../controllers/auth/index.js';
import validator from '../../utils/validator/passwordResetValidate.js';

const router = express.Router();
router.post('/forgot-password', validator.forgotPassword, auth.forgotPassword);
router.post('/reset-password', validator.resetPassword, auth.resetPassword);

export default router;
