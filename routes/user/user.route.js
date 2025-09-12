import express from 'express';
import userCons from '../../controllers/user/index.js';
import {
  getProfile,
  checkProfileCompletion,
} from '../../controllers/user/profile.js';
import validate from '../../utils/validators/userValidate.js';
import { isAuthenticated, allowTo } from '../../middleware/authMiddleware.js';
import {
  userProfileUpload,
  processUserProfileUpload,
  deleteOldImages,
} from '../../middleware/uploadMiddleware.js';
import {
  getCurrentUserImage,
  cleanupImagesOnDelete,
} from '../../middleware/imageCleanupMiddleware.js';
import userModel from '../../models/userModel.js';

const router = express.Router();
router.use(isAuthenticated, allowTo('customer'));
router
  .route('/')
  .patch(
    getCurrentUserImage,
    userProfileUpload,
    processUserProfileUpload,
    deleteOldImages,
    validate.update,
    userCons.update
  )
  .delete(cleanupImagesOnDelete(userModel, ['image']), userCons.deleteMe);
router.get('/profile', getProfile);
router.get('/profile/completion', checkProfileCompletion);

export default router;
