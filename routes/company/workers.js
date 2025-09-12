import express from 'express';
import workerCon from '../../controllers/company/workers/index.js';
import workerValidate from '../../utils/validators/workerValidate.js';
import {
  workerCreationUpload,
  processWorkerUploads,
  deleteOldImages,
} from '../../middleware/uploadMiddleware.js';
import { getCurrentWorkerImages, cleanupImagesOnDelete } from '../../middleware/imageCleanupMiddleware.js';
import workerModel from '../../models/workerModel.js';

const router = express.Router();

router
  .route('/')
  .get(workerCon.getAll) // GET /api/companies/workers
  .post(
    workerCreationUpload,
    processWorkerUploads,
    workerValidate.create,
    workerCon.create
  ); // POST /api/companies/workers

router
  .route('/:id')
  .get(workerCon.getOne)
  .patch(
    getCurrentWorkerImages,
    workerCreationUpload,
    processWorkerUploads,
    deleteOldImages,
    workerValidate.update,
    workerCon.update
  )
  .delete(
    cleanupImagesOnDelete(workerModel, ['pictureWorker', 'introductoryVideo']),
    workerCon.deleteWorker
  );

export default router;
