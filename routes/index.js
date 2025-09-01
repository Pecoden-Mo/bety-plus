import express from 'express';
import userRouts from './user/index.js';
import adminRouts from './admin/index.js';
import companyRouts from './company/index.js';
import authRoutes from './auth/auth.route.js';
import notificationRoutes from './notification/index.js';
import workerRoute from './worker.route.js';
import paymentRouter from './payment/index.js';
import pricingRouter from './pricing/index.js';
// import adminCompanyRoutes from './admin/companyManagement.js';

const router = express.Router();
router.use('/auth', authRoutes);
router.use('/users', userRouts);
router.use('/admins', adminRouts);
router.use('/companies', companyRouts);
router.use('/notifications', notificationRoutes);
router.use('/workers', workerRoute);
router.use('/payments', paymentRouter);
router.use('/pricing', pricingRouter);

export default router;
