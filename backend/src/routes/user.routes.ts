import { Router } from 'express';
import { getUser, getAllUsers, createUser } from '../controllers/user.controller';
import { validateRequest } from '../middleware/validateRequest';
import { createUserSchema } from '../validation/user.validation';

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUser);
router.post('/', validateRequest(createUserSchema), createUser);

export default router;
