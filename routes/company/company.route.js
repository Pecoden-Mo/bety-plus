import express from 'express';
import companyCon from '../../controllers/company/index.js';

const router = express.Router();

// Company profile routes
router
  .route('/me')
  .get(companyCon.getMe)
  .patch(companyCon.update)
  .delete(companyCon.deleteCompany);

export default router;
