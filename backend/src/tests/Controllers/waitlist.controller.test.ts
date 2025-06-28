// ✅ 1. Declare mocks BEFORE imports
const mockAddToWaitlist = jest.fn().mockResolvedValue({
  id: 'waitlist-id-123',
  user_id: '123e4567-e89b-12d3-a456-426614174000',
  slot_id: '123e4567-e89b-12d3-a456-426614174111',
  waitlist_position: 1,
  waitlist_status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockGetPosition = jest.fn().mockResolvedValue({
  position: 2,
  total: 5,
});

// ✅ 2. Mock the service BEFORE importing anything else
jest.mock('@/services/Waitlist/waitlist.service', () => {
  return {
    WaitlistService: jest.fn().mockImplementation(() => ({
      addToWaitlist: mockAddToWaitlist,
      getPosition: mockGetPosition,
    })),
  };
});

// ✅ 3. Now import required modules
import request from 'supertest';
import express from 'express';
import waitlistRoutes from '@/routes/waitlist.routes';
import bodyParser from 'body-parser';

describe('WaitlistController (Jest)', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(bodyParser.json());
    app.use('/waitlist', waitlistRoutes); // Mount waitlist routes
  });

  describe('POST /waitlist/join', () => {
    it('should return 201 and the waitlist info on valid input', async () => {
      const res = await request(app)
        .post('/waitlist/join')
        .send({
          userId: '123e4567-e89b-12d3-a456-426614174000',
          slotId: '123e4567-e89b-12d3-a456-426614174111',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('user_id', '123e4567-e89b-12d3-a456-426614174000');
      expect(res.body.data).toHaveProperty('waitlist_position', 1);
    });

    it('should return 400 for missing input', async () => {
      const res = await request(app).post('/waitlist/join').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /waitlist/position', () => {
    it('should return 200 and waitlist position data on valid query', async () => {
      const res = await request(app)
        .get('/waitlist/position')
        .query({
          userId: '123e4567-e89b-12d3-a456-426614174000',
          slotId: '123e4567-e89b-12d3-a456-426614174111',
        });

      console.log('💬 GET /waitlist/position response:', res.body);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('position', 2);
      expect(res.body.data).toHaveProperty('total', 5);
    });

    it('should return 400 for missing query params', async () => {
      const res = await request(app).get('/waitlist/position');
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
