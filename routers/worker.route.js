import express from 'express';
import workerCon from '../controllers/company/worker/index.js';

const router = express.Router();

router.route('/').get(workerCon.getAll);

router.route('/:id').get(workerCon.getOne);

export default router;
