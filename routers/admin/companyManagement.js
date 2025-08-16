import express from 'express';
import {
  approveCompany,
  rejectCompany,
  getPendingCompanies,
  getAllCompanies,
} from '../../controllers/admin/companyManagement.js';
import { isAuthenticated } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Protect all admin routes
router.use(isAuthenticated);

// Admin company management routes
router.get('/companies', getAllCompanies);
router.get('/companies/pending', getPendingCompanies);
router.patch('/companies/:id/approve', approveCompany);
router.patch('/companies/:id/reject', rejectCompany);

export default router;
