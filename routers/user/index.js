import express from 'express';
import auth from './auth.route.js';
import userRoute from './user.route.js';

const router = express.Router();

router.use('/auth', auth);

router.use('/', userRoute);

export default router;
