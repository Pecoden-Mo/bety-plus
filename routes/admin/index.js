import express from 'express';
import dashboard from './dashboard.route.js';
import { allowTo, isAuthenticated } from '../../middleware/authMiddleware.js';

const router = express.Router();
router.use(isAuthenticated, allowTo('admin'));
router.use('/dashboard', dashboard);

export default router;
