import express from 'express';
import workerCon from '../../controllers/company/worker/index.js';
import workerValidate from '../../utils/validator/workerValidate.js';

const router = express.Router();

// Worker CRUD routes for companies
router
  .route('/')
  .get(workerCon.getAll)
  .post(workerValidate.create, workerCon.create);

router
  .route('/:id')
  .get(workerCon.getOne)
  .patch(workerValidate.update, workerCon.update)
  .delete(workerCon.deleteWorker);

export default router;
