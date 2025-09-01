import express from 'express';
import auth from '../../controllers/company/index.js';
import companyValidate from '../../utils/validators/companyValidate.js';

const router = express.Router();
router.post('/register', companyValidate.registerValidator, auth.register);

export default router;
