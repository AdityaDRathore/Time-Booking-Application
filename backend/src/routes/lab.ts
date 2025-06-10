import express from 'express';
import { authenticate, checkRole } from '../middleware/auth.middleware';
import { checkPermission } from '../authorization/middleware/rbacMiddleware';
import { requireResourceAccess } from '../authorization/middleware/resourceAccessMiddleware';
import * as labController from '../controllers/lab.controller';
import { ALL_PERMISSIONS } from '../authorization/constants/permissions'; // Use permission constants here
import { UserRole } from '@prisma/client';
import { ResourceType } from '../authorization/constants/ownership'; // Import ResourceType enum

const router = express.Router();

// Create a new lab (only ADMIN or SUPER_ADMIN)
router.post(
  '/',
  authenticate,
  checkRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  checkPermission([ALL_PERMISSIONS.CREATE_LAB]), // Use runtime permission constant
  labController.createLab
);

// Get all labs (any authenticated user with read permission)
router.get(
  '/',
  authenticate,
  checkPermission([ALL_PERMISSIONS.READ_LABS]), // Use runtime permission constant
  labController.getLabs
);

// Get a single lab by ID (check resource access and permission)
router.get(
  '/:id',
  authenticate,
  checkPermission([ALL_PERMISSIONS.READ_LABS]),
  requireResourceAccess(ResourceType.LAB, ALL_PERMISSIONS.READ_LABS), // <-- ADDED requiredPermission
  labController.getLabById
);

// Update a lab (only ADMIN or SUPER_ADMIN who owns the lab)
router.put(
  '/:id',
  authenticate,
  checkRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
  checkPermission([ALL_PERMISSIONS.UPDATE_LAB]),
  requireResourceAccess(ResourceType.LAB, ALL_PERMISSIONS.UPDATE_LAB), // <-- ADDED requiredPermission
  labController.updateLab
);

// Delete a lab (only SUPER_ADMIN)
router.delete(
  '/:id',
  authenticate,
  checkRole([UserRole.SUPER_ADMIN]),
  checkPermission([ALL_PERMISSIONS.DELETE_LAB]),
  requireResourceAccess(ResourceType.LAB, ALL_PERMISSIONS.DELETE_LAB), // <-- ADDED requiredPermission
  labController.deleteLab
);

export default router;