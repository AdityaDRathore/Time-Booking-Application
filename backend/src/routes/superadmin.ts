import { Router } from 'express';

const router = Router();

// POST /superadmin/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  console.log('Superadmin login attempt:', email);

  // Basic hardcoded check (replace with real DB check later)
  if (email === 'superadmin@mpgovt.in' && password === 'SuperAdmin123!') {
    return res.status(200).json({
      message: 'Login successful',
      token: 'dummy-jwt-token',  // Replace with real JWT later
    });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
});

export default router;
