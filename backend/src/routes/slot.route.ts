// src/routes/slot.routes.ts
import { Router } from 'express';
import * as slotController from '../controllers/slot.controller';

const router = Router();

router.post('/', slotController.createSlot);
router.get('/', slotController.getAllSlots);
router.get('/:id', slotController.getSlotById);
router.put('/:id', slotController.updateSlot);
router.delete('/:id', slotController.deleteSlot);

export default router;
