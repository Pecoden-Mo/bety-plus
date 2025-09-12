import express from 'express';
import companyCon from '../../controllers/company/index.js';
import {
  companyRegistrationUpload,
  processCompanyUpload,
  deleteOldImages,
} from '../../middleware/uploadMiddleware.js';
import { getCurrentCompanyImage } from '../../middleware/imageCleanupMiddleware.js';

const router = express.Router();

// Company profile routes
router
  .route('/me')
  .get(companyCon.getMe)
  .patch(
    getCurrentCompanyImage, 
    companyRegistrationUpload, 
    processCompanyUpload, 
    deleteOldImages,
    companyCon.update
  )
  .delete(companyCon.deleteCompany);

export default router;
