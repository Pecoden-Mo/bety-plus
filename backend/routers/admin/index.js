import auth from './authRoute.js';
import express from 'express';

const router = express.Router();

router.use('/auth', auth);

export default router;
