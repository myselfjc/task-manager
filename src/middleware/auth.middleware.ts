import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { UnauthorizedError, InternalError } from '../errors';

const userRepository = AppDataSource.getRepository(User);

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  // Get authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(UnauthorizedError());
  }

  // Get token and secret
  const token = authHeader.slice(7);
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return next(InternalError('Server misconfiguration'));
  }

  try {
    // Verify token and get user ID
    const payload = jwt.verify(token, secret) as { userId: string };
    const user = await userRepository.findOne({
      where: {
        id: payload.userId
      }
    });

    // If user not found, return unauthorized error
    if (!user) {
      return next(UnauthorizedError());
    }

    // Attach user to request
    req.user = user;
    next();
  } catch {
    next(UnauthorizedError());
  }
}
