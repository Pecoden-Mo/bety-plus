import express from 'express';
import authRoute from './auth.route.js';
import workerRoute from './worker.route.js';
import { allowTo, isAuthenticated } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.use('/auth', authRoute);
router.use(isAuthenticated, allowTo('company'));
router.use('/workers', workerRoute);

export default router;
