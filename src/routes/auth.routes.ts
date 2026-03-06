import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { RegisterDto, LoginDto } from '../dto/auth.dto';

const authRouter = Router();

authRouter.post('/register', validateBody(RegisterDto), register);
authRouter.post('/login', validateBody(LoginDto), login);

export { authRouter };
