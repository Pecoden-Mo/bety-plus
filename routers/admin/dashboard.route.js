import express from 'express';
import dashboard from '../../controllers/admin/index.js';
import validation from '../../utils/validator/adminValidate.js';
import companyManage from './companyManagement.js';

const router = express.Router();

router.post('/add-admin', validation.register, dashboard.create);
router.use('/companies', companyManage);
// company management routes

export default router;
