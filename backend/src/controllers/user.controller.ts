import { Request, Response, NextFunction } from 'express';
import { AppError, errorTypes } from '../utils/errors';
import { sendSuccess } from '../utils/response';

// Fake in-memory users (for now)
const fakeUsers = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' },
];

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = fakeUsers.find(u => u.id === id);

    if (!user) {
      throw new AppError('User not found', errorTypes.NOT_FOUND);
    }

    sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    sendSuccess(res, fakeUsers);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;

    if (!name) {
      throw new AppError('Name is required', errorTypes.BAD_REQUEST);
    }

    const newUser = { id: String(fakeUsers.length + 1), name };
    fakeUsers.push(newUser);

    sendSuccess(res, newUser, 201);
  } catch (err) {
    next(err);
  }
};
