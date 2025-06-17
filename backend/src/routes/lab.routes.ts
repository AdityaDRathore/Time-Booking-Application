// src/routes/lab.routes.ts

import { Router } from 'express';
import {
  createLab,
  getLabs,
  getLabById,
  updateLab,
  deleteLab,
} from '../controllers/lab.controller';
import { validateRequest } from '../middleware/validateRequest';
import {
  createLabSchema,
  updateLabSchema,
} from '../validation/lab.validation';

const router = Router();

// ✅ Create Lab with validation
router.post('/', validateRequest(createLabSchema), createLab);

// ✅ Get all Labs
router.get('/', getLabs);

// ✅ Get Lab by ID
router.get('/:id', getLabById);

// ✅ Update Lab with validation
router.put('/:id', validateRequest(updateLabSchema), updateLab);

// ✅ Delete Lab
router.delete('/:id', deleteLab);

export default router;
