import express from 'express';
import auth from '../../controllers/company/auth/index.js';
import companyValidate from '../../utils/validator/companyValidate.js';
const router = express.Router();
router.post('/register', companyValidate.registerValidator, auth.register);
router.post('/login', companyValidate.loginValidator, auth.login);
router.post('/logout', auth.logout);

export default router;
