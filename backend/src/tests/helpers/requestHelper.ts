import request from 'supertest';
import app from '@src/app';

export const apiRequest = () => request(app);
