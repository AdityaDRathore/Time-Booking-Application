export const mockSocket = {
  emit: jest.fn(),
  to: jest.fn().mockReturnThis(),
  broadcast: {
    emit: jest.fn(),
  },
};
