import express from 'express';
import auth from '../../controllers/user/auth/index.js';
import userValidate from '../../utils/validator/userValidate.js';
//---------------------------------------------------
const router = express.Router();

router.post('/register', userValidate.registerValidator, auth.register);
router.post('/login', userValidate.loginValidator, auth.login);

export default router;
