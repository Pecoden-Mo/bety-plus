import express from 'express';
import dashboard from './dashboard.route.js';
import payment from './payment.route.js';
import { allowTo, isAuthenticated } from '../../middleware/authMiddleware.js';

const router = express.Router();
router.use(isAuthenticated, allowTo('admin'));
router.use('/dashboard', dashboard);
router.use('/payments', payment);

export default router;
