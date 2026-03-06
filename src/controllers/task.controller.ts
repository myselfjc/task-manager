import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { CreateTaskDto, UpdateTaskDto } from '../dto/task.dto';
import { TaskStatus } from '../entities/Task';
import { UnauthorizedError } from '../errors';

const taskService = new TaskService();

export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) return next(UnauthorizedError());
    const dto = req.body as CreateTaskDto;
    const task = await taskService.create(req.user.id, dto);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function listTasks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) return next(UnauthorizedError());
    const status = req.query.status as TaskStatus | undefined;
    const tasks = await taskService.findAll(
      { id: req.user.id, role: req.user.role },
      status
    );
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function getTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) return next(UnauthorizedError());
    const { id } = req.params as { id: string };
    const task = await taskService.findOne(id, {
      id: req.user.id,
      role: req.user.role,
    });
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) return next(UnauthorizedError());
    const dto = req.body as UpdateTaskDto;
    const { id } = req.params as { id: string };
    const task = await taskService.update(id, {
      id: req.user.id,
      role: req.user.role,
    }, dto);
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) return next(UnauthorizedError());
    const { id } = req.params as { id: string };
    await taskService.softDelete(id, {
      id: req.user.id,
      role: req.user.role,
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
