import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { RegisterDto } from '../dto/auth.dto';
import { AppError, ConflictError, UnauthorizedError, InternalError } from '../errors';
import { EXPIRY_TIME, SALT_ROUNDS } from '../config/constants';

const userRepository = AppDataSource.getRepository(User);

export class AuthService {
  async register(dto: RegisterDto): Promise<{ user: Omit<User, 'password'>; token: string }> {
    try {
      const { email, password } = dto;

      // Check if email exists
      const existing = await userRepository.findOne(
        { where: { email } }
      )
      if (existing) {
        throw ConflictError('Email already registered');
      }

      // Hash password and save the user
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const user = userRepository.create({
        email: dto.email,
        password: hashedPassword,
        role: 'user',
      });
      await userRepository.save(user);

      // Issue token
      const token = this.issueToken(user.id);

      // Destruct password from the user object
      const { password: _password, ...userWithoutPassword } = user;

      // Return the user and token
      return { user: userWithoutPassword, token };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw InternalError();
    }
  }

  // Login a user
  async login(
    email: string,
    password: string
  ): Promise<{ user: Omit<User, 'password'>; token: string }> {
    try {
      // Check if user exists and password is correct
      const user = await userRepository.findOne(
        { where: { email } }
      );
      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw UnauthorizedError('Invalid email or password');
      }

      // Issue token
      const token = this.issueToken(user.id);

      // Destruct password from the user object and return
      const { password: _password, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw InternalError();
    }
  }

  // Issue a token
  private issueToken(userId: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw InternalError('Server misconfiguration');

    return jwt.sign({ userId }, secret, { expiresIn: EXPIRY_TIME });
  }
}
