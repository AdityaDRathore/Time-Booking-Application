import { Router } from 'express';
import * as waitlistController from '../controllers/waitlist.controller';
import validate from '../middleware/validate.middleware';
import {
  joinWaitlistSchema,
  getWaitlistPositionSchema,
} from '@src/validation/waitlist.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Waitlist
 *   description: Waitlist management APIs
 */

/**
 * @swagger
 * /api/v1/waitlist/join:
 *   post:
 *     summary: Add user to the waitlist
 *     tags: [Waitlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JoinWaitlistInput'
 *     responses:
 *       201:
 *         description: Successfully joined waitlist
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/join', validate(joinWaitlistSchema), waitlistController.joinWaitlist);

/**
 * @swagger
 * /api/v1/waitlist/position:
 *   get:
 *     summary: Get the waitlist position of a user for a slot
 *     tags: [Waitlist]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the user
 *       - in: query
 *         name: slotId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the time slot
 *     responses:
 *       200:
 *         description: Successfully retrieved waitlist position
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     position:
 *                       type: number
 *       400:
 *         description: Missing query parameters
 *       500:
 *         description: Internal server error
 */
router.get('/position', validate(getWaitlistPositionSchema, 'query'), waitlistController.getWaitlistPosition);
export default router;
