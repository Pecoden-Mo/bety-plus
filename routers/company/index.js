import express from 'express';
import authRoute from './auth.route.js';
import companyRoute from './company.route.js';
import workerRoute from './worker.route.js';
import { allowTo, isAuthenticated } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use('/auth', authRoute);

router.use(isAuthenticated, allowTo('company'));
router.use('/workers', workerRoute);
router.use('/', companyRoute);

export default router;
