import express from 'express';
import dashboard from '../../controllers/admin/index.js';
import validation from '../../utils/validator/adminValidate.js';

const router = express.Router();

router.post('/add-admin', validation.register, dashboard.create);

export default router;
