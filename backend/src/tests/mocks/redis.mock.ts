export const mockRedisClient = {
  publish: jest.fn(),
  subscribe: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn(),
};
