import { Router } from 'express';
import { csrfProtection, attachCsrfToken } from '../middleware/csrf.middleware'; // ✅ Import CSRF middleware

/**
 * @swagger
 * tags:
 *   name: Test
 *   description: Routes for verifying middleware and behavior
 */

const router = Router();

// ✅ Apply CSRF protection only for test routes
router.use(csrfProtection);
router.use(attachCsrfToken);

console.log('[test.routes] Loaded ✅');

/**
 * @swagger
 * /api/v1/test/sanitize:
 *   post:
 *     summary: Test sanitization middleware
 *     tags: [Test]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               input:
 *                 type: string
 *                 example: "<script>alert('xss')</script>"
 *     responses:
 *       200:
 *         description: Echo sanitized input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sanitizedInput:
 *                   type: string
 */
router.post('/sanitize', (req, res) => {
  console.log('[TEST] /sanitize route hit ✅');
  const input = req.body.input;
  if (typeof input !== 'string') {
    return res.status(400).json({ error: 'Invalid input type' });
  }
  res.json({ sanitizedInput: input });
});

/**
 * @swagger
 * /api/v1/test/mongo-sanitize:
 *   post:
 *     summary: Test mongo-sanitize middleware
 *     tags: [Test]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               input:
 *                 type: object
 *                 example: { "$ne": "" }
 *     responses:
 *       200:
 *         description: Echo sanitized input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sanitizedInput:
 *                   type: object
 */
router.post('/mongo-sanitize', (req, res) => {
  const input = req.body.input;
  res.json({ sanitizedInput: input });
});

/**
 * @swagger
 * /api/v1/test/csrf-protected:
 *   post:
 *     summary: Test CSRF protection
 *     tags: [Test]
 *     security:
 *       - csrfAuth: []
 *     responses:
 *       200:
 *         description: CSRF token valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ✅ CSRF Token Validated Successfully!
 */
router.post('/csrf-protected', (req, res) => {
  res.json({ message: '✅ CSRF Token Validated Successfully!' });
});

/**
 * @swagger
 * /api/v1/test/csrf-token:
 *   get:
 *     summary: Get CSRF token (sets cookie and returns it)
 *     tags: [Test]
 *     description: Returns a CSRF token to be sent in header `X-XSRF-TOKEN` for protected routes.
 *     responses:
 *       200:
 *         description: CSRF token provided
 *         headers:
 *           Set-Cookie:
 *             description: Contains the CSRF token cookie named `XSRF-TOKEN`
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csrfToken:
 *                   type: string
 */
router.get('/csrf-token', (req, res) => {
  const token = req.csrfToken();
  res.cookie('XSRF-TOKEN', token);
  res.status(200).json({ csrfToken: token });
});

export default router;
