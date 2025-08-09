import userRout from './user/index.js';
import adminRout from './admin/index.js';
import companyRout from './company/index.js';
import authPassword from './auth/passwordRoute.js';

import express from 'express';

const router = express.Router();
router.use('/auth', authPassword);
router.use('/users', userRout);
router.use('/admins', adminRout);
router.use('/companies', companyRout);

export default router;
