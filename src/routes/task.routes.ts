import { Router } from 'express';
import {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/task.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';

const taskRouter = Router();

taskRouter.use(authMiddleware);

taskRouter.get('/', listTasks);
taskRouter.get('/:id', getTask);
taskRouter.post('/', validateBody(CreateTaskDto), createTask);
taskRouter.patch('/:id', validateBody(UpdateTaskDto), updateTask);
taskRouter.delete('/:id', deleteTask);

export { taskRouter };
