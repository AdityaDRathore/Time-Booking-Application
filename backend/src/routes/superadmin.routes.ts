import { Router } from 'express';
import superAdminController from '../controllers/superadmin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRoles } from '../authorization/middleware/rbacMiddleware';
import { UserRole } from '@prisma/client';
const router = Router();

/**
 * Routes for SUPER_ADMIN role
 * All routes are protected with `authenticate` and `rbacMiddleware`
 */

router.use(authenticate);
router.use(requireRoles([UserRole.SUPER_ADMIN]));

// GET /api/v1/superadmin/admin-requests
router.get('/admin-requests', superAdminController.listPendingAdminRequests);

// POST /api/v1/superadmin/admin-requests/:id/approve
router.post('/admin-requests/:id/approve', superAdminController.approveAdminRequest);

// POST /api/v1/superadmin/admin-requests/:id/reject
router.post('/admin-requests/:id/reject', superAdminController.rejectAdminRequest);

export default router;
