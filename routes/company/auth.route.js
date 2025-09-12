import express from 'express';
import auth from '../../controllers/company/index.js';
import companyValidate from '../../utils/validators/companyValidate.js';
import {
  companyRegistrationUpload,
  processCompanyUpload,
} from '../../middleware/uploadMiddleware.js';

const router = express.Router();
router.post(
  '/register',
  companyRegistrationUpload,
  processCompanyUpload,
  companyValidate.registerValidator,
  auth.register
);

export default router;
