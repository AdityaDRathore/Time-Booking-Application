import request from 'supertest';
import app from '../../../src/app';

describe('CSRF Protection Middleware', () => {
  it('should reject POST request without CSRF token', async () => {
    const response = await request(app)
      .post('/api/v1/test/sanitize')
      .send({ input: 'test' });

    expect(response.status).toBe(403);
    expect(response.text).toMatch(/invalid csrf token/i);
  });

  it('should allow POST with valid CSRF token in cookie and header', async () => {
    const agent = request.agent(app);

    // Step 1: Get CSRF token by hitting a GET route that sets it
    const getResponse = await agent.get('/api/v1/test/csrf-token');
    const cookies = getResponse.headers['set-cookie'];
    const csrfToken = getResponse.body.csrfToken;

    expect(csrfToken).toBeDefined();

    // Step 2: Send POST request with CSRF token in header and cookie
    const postResponse = await agent
      .post('/api/v1/test/sanitize')
      .set('Cookie', cookies)
      .set('XSRF-TOKEN', csrfToken) // <-- header must match cookie name
      .send({ input: 'secured data' });

    expect(postResponse.status).toBe(200);
    expect(postResponse.body.sanitizedInput).toBe('secured data');
  });
});
