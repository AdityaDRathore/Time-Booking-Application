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

/**
 * @swagger
 * tags:
 *   name: Labs
 *   description: Lab management APIs
 */

/**
 * @swagger
 * /labs:
 *   post:
 *     summary: Create a new lab
 *     tags: [Labs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLab'
 *     responses:
 *       201:
 *         description: Lab created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', validateRequest(createLabSchema), createLab);

/**
 * @swagger
 * /labs:
 *   get:
 *     summary: Get all labs
 *     tags: [Labs]
 *     responses:
 *       200:
 *         description: List of labs
 */
router.get('/', getLabs);

/**
 * @swagger
 * /labs/{id}:
 *   get:
 *     summary: Get lab by ID
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lab found
 *       404:
 *         description: Lab not found
 */
router.get('/:id', getLabById);

/**
 * @swagger
 * /labs/{id}:
 *   put:
 *     summary: Update a lab
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLab'
 *     responses:
 *       200:
 *         description: Lab updated
 *       404:
 *         description: Lab not found
 */
router.put('/:id', validateRequest(updateLabSchema), updateLab);

/**
 * @swagger
 * /labs/{id}:
 *   delete:
 *     summary: Delete a lab
 *     tags: [Labs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Lab deleted
 *       404:
 *         description: Lab not found
 */
router.delete('/:id', deleteLab);

export default router;
