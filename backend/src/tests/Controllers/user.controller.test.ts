import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import * as userController from '@/controllers/user.controller';
import { globalErrorHandler } from '@/middleware/error.middleware';
import { sendSuccess } from '@/utils/response';

jest.mock('@/utils/response', () => ({
  sendSuccess: jest.fn((res, data, status = 200) => res.status(status).json({ success: true, data })),
}));

const app = express();
app.use(express.json());

// Mount routes manually for test
app.get('/users', userController.getAllUsers);
app.get('/users/:id', userController.getUser);
app.post('/users', userController.createUser);

// Optional: centralized error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message });
});

describe('User Controller', () => {
  it('should return all users', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should return a user by ID', async () => {
    const res = await request(app).get('/users/1');
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Alice');
  });

  it('should return 404 for unknown user', async () => {
    const res = await request(app).get('/users/999');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should create a user', async () => {
    const res = await request(app).post('/users').send({ name: 'Charlie' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Charlie');
  });

  it('should return 400 if name is missing', async () => {
    const res = await request(app).post('/users').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
