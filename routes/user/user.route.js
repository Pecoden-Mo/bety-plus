import express from 'express';
import userCons from '../../controllers/user/index.js';
import {
  getProfile,
  checkProfileCompletion,
} from '../../controllers/user/profile.js';
import validate from '../../utils/validators/userValidate.js';
import { isAuthenticated, allowTo } from '../../middleware/authMiddleware.js';

const router = express.Router();
router.use(isAuthenticated, allowTo('customer'));
router
  .route('/')
  .patch(validate.update, userCons.update)
  .delete(userCons.deleteMe);
router.get('/me', userCons.getMe);
router.get('/profile', getProfile);
router.get('/profile/completion', checkProfileCompletion);

export default router;
