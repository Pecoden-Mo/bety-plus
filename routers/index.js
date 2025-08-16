import express from 'express';
import userRout from './user/index.js';
import adminRout from './admin/index.js';
import companyRout from './company/index.js';
import authRoute from './auth/auth.route.js';
import notificationRoutes from './notification/index.js';
// import adminCompanyRoutes from './admin/companyManagement.js';

const router = express.Router();
router.use('/auth', authRoute);
router.use('/users', userRout);
router.use('/admins', adminRout);
router.use('/companies', companyRout);
router.use('/notifications', notificationRoutes);
// router.use('/admin', adminCompanyRoutes);

export default router;
