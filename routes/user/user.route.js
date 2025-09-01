import express from 'express';
import userCons from '../../controllers/user/index.js';
import validate from '../../utils/validators/userValidate.js';
import { isAuthenticated, allowTo } from '../../middleware/authMiddleware.js';

const router = express.Router();
router.use(isAuthenticated, allowTo('customer'));
router
  .route('/')
  .patch(validate.update, userCons.update)
  .delete(userCons.deleteMe);
router.get('/me', userCons.getMe);

export default router;
