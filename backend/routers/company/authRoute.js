import express from 'express';
import auth from '../../controllers/company/auth/index.js';
import companyValidate from '../../utils/validator/companyValidate.js';
const router = express.Router();
router.post('/register', companyValidate.registerValidator, auth.register);

export default router;
