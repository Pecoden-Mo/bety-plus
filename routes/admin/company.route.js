import express from 'express';
import {
  approveCompany,
  rejectCompany,
  getPendingCompanies,
  getAllCompanies,
  getCompany,
} from '../../controllers/admin/company.js';
// import {} from "../../"
import { isAuthenticated } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Protect all admin routes
router.use(isAuthenticated);

// Admin company management routes
router.get('/', getAllCompanies);
router.get('/pending', getPendingCompanies);

router.get('/:id', getCompany);
router.patch('/:id/approve', approveCompany);
router.patch('/:id/reject', rejectCompany);
// toggle status of a company
export default router;
