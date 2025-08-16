import express from 'express';
import userRout from './user/index.js';
import adminRout from './admin/index.js';
import companyRout from './company/index.js';
import authRoute from './auth/auth.route.js';

const router = express.Router();
router.use('/auth', authRoute);
router.use('/users', userRout);
router.use('/admins', adminRout);
router.use('/companies', companyRout);

export default router;
