import express from 'express';
import register from '../controllers.js/auth/user/register.js';
import login from '../controllers.js/auth/user/login.js';
import socialAuth from './socialAuthRoute.js';
import userValidate from '../utils/validator/userValidate.js';
const router = express.Router();

router.post('/auth/register', userValidate.registerValidator, register);
router.post('/auth/login', userValidate.loginValidator, login);
router.use('/auth/social', socialAuth);

// auth with social media

export default router;
