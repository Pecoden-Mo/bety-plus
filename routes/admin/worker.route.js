import express from 'express';
import { isAuthenticated } from '../../middleware/authMiddleware.js';
import {
  getWorker,
  getAllWorkers,
  // getPendingWorkers,
  approveWorker,
  rejectWorker,
  getPendingWorkers,
} from '../../controllers/admin/worker.js';

const router = express.Router();

// Protect all admin routes
router.use(isAuthenticated);

// Admin company management routes
router.get('/', getAllWorkers);
router.get('/pending', getPendingWorkers);

router.get('/:id', getWorker);
router.patch('/:id/approve', approveWorker);
router.patch('/:id/reject', rejectWorker);

export default router;
