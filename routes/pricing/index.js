import express from 'express';
import pricingController from '../../controllers/pricing/index.js';
import { isAuthenticated, allowTo } from '../../middleware/authMiddleware.js';
import {
  createPricingValidation,
  updatePricingValidation,
  getPricingValidation,
  getPricingByRegionValidation,
  getAllPricingValidation,
} from '../../utils/validators/pricingValidate.js';
import validator from '../../middleware/expressValidator.js';

const router = express.Router();

// Public routes
router.get(
  '/region/:region',
  getPricingByRegionValidation,
  validator,
  pricingController.getByRegion
);
router.get('/stats', pricingController.getStats);

// Protected routes - Admin only
router.use(isAuthenticated, allowTo('admin'));

router
  .route('/')
  .get(getAllPricingValidation, pricingController.getAll)
  .post(createPricingValidation, pricingController.create);

router
  .route('/:id')
  .get(getPricingValidation, pricingController.getOne)
  .patch(updatePricingValidation, pricingController.update)
  .delete(getPricingValidation, pricingController.delete);

export default router;
