import express from 'express';
import authRoute from './auth.route.js';
import companyRoute from './company.route.js';
import workerRoute from './workers.js';
import { allowTo, isAuthenticated } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.use('/auth', authRoute);

router.use(isAuthenticated, allowTo('company'));
router.use('/workers', workerRoute);
router.use('/', companyRoute);

export default router;
