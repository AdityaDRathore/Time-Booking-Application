import request from 'supertest';
import app from '@src/app';

export const getTokenForUser = async (email: string, password: string) => {
  const res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email, password });

  if (res.status !== 200 || !res.body.data?.accessToken) {
    console.error(`Login failed for ${email}:`, res.body);
    throw new Error('Login failed');
  }

  return res.body.data.accessToken;
};
