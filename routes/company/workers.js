import express from 'express';
import workerCon from '../../controllers/company/workers/index.js';
import workerValidate from '../../utils/validators/workerValidate.js';

const router = express.Router();

router
  .route('/')
  .get(workerCon.getAll) // GET /api/companies/workers
  .post(workerValidate.create, workerCon.create); // POST /api/companies/workers

router
  .route('/:id')
  .get(workerCon.getOne)
  .patch(workerValidate.update, workerCon.update)
  .delete(workerCon.deleteWorker);

export default router;
