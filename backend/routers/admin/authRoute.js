import express from 'express';
import adminCon from '../../controllers/admin/auth/index.js';
import validation from '../../utils/validator/adminValidate.js';

const router = express.Router();

router.post('/register', validation.register, adminCon.register);
router.post('/login', validation.login, adminCon.login);

export default router;
