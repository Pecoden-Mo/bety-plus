import express from 'express';
import auth from '../../controllers/user/auth/index.js';
import socialAuth from './social.route.js';
import validate from '../../utils/validators/userValidate.js';
//---------------------------------------------------
const router = express.Router();

router.post('/register', validate.register, auth.register);
router.use('/social', socialAuth); // social auth in : localhost:3020/api/v1/users/auth/social/google/callback

export default router;
