// src/routes/adminLab.routes.ts

import { Router } from 'express';
import {
  getLabs,
  getLabById,
  createLab,
  updateLab,
  deleteLab,
} from '../controllers/lab.controller';
import { validateRequest } from '../middleware/validateRequest';
import {
  createLabSchema,
  updateLabSchema,
} from '../validation/lab.validation';

const router = Router();

router.get('/', getLabs);
router.post('/', validateRequest(createLabSchema), createLab);
router.get('/:id', getLabById);
router.put('/:id', validateRequest(updateLabSchema), updateLab);
router.delete('/:id', deleteLab);

export default router;
