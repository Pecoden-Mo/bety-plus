import express from 'express';
import dashboard from '../../controllers/admin/index.js';
import validation from '../../utils/validators/adminValidate.js';
import companyManage from './company.route.js';
import worker from './worker.route.js';

const router = express.Router();

router.post('/add-admin', validation.register, dashboard.create);
router.use('/companies', companyManage);
router.use('/workers', worker);
// company management routes

export default router;
