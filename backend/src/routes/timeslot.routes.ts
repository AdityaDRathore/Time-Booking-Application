import { Router } from 'express';
import {
  createTimeSlot,
  getAllTimeSlots,
  getTimeSlotById,
  deleteTimeSlot,
} from '../controllers/timeslot.controller';

import { validateRequest } from '../middleware/validateRequest';
import { timeSlotSchema } from '../validators/timeslot.validator';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: TimeSlots
 *   description: Time slot management APIs
 */

/**
 * @swagger
 * /api/v1/timeslots:
 *   post:
 *     summary: Create a new time slot
 *     tags: [TimeSlots]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTimeSlotInput'
 *     responses:
 *       201:
 *         description: Time slot created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */
router.post('/', validateRequest(timeSlotSchema), createTimeSlot);

/**
 * @swagger
 * /api/v1/timeslots:
 *   get:
 *     summary: Get all time slots
 *     tags: [TimeSlots]
 *     responses:
 *       200:
 *         description: A list of time slots
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TimeSlot'
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllTimeSlots);

/**
 * @swagger
 * /api/v1/timeslots/{id}:
 *   get:
 *     summary: Get a specific time slot by ID
 *     tags: [TimeSlots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Time slot ID
 *     responses:
 *       200:
 *         description: Time slot found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimeSlot'
 *       404:
 *         description: Time slot not found
 */
router.get('/:id', getTimeSlotById);

/**
 * @swagger
 * /api/v1/timeslots/{id}:
 *   delete:
 *     summary: Delete a specific time slot by ID
 *     tags: [TimeSlots]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Time slot ID
 *     responses:
 *       200:
 *         description: Time slot deleted
 *       404:
 *         description: Time slot not found
 */
router.delete('/:id', deleteTimeSlot);

export default router;
