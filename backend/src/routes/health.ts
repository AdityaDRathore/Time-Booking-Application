// src/routes/health.ts or similar
import { Router } from 'express';
const router = Router();

router.get('/health', (_, res) => {
  res.status(200).send('OK');
});

export default router;
