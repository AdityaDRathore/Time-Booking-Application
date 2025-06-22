import request from 'supertest';
import app from '@src/app';

export const getTestUserToken = async () => {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({
      email: 'testuser@example.com',
      password: 'password123'
    });

  return res.body.token; // Adjust this based on your API response
};
