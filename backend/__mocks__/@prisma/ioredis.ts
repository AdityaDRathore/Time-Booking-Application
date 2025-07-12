// __mocks__/ioredis.ts
export default jest.fn().mockImplementation(() => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  on: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
}));
