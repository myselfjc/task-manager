import { AppDataSource } from '../config/database';
import { Task, TaskStatus } from '../entities/Task';
import { UserRole } from '../entities/User';
import { CreateTaskDto } from '../dto/task.dto';
import { UpdateTaskDto } from '../dto/task.dto';
import { AppError, InternalError, NotFoundError } from '../errors';

const taskRepository = AppDataSource.getRepository(Task);

export type TaskCaller = { id: string; role: UserRole };

export class TaskService {
  async create(ownerId: string, dto: CreateTaskDto): Promise<{ message: string, task: Task }> {
    try {
      const { title, description, status, dueDate } = dto;

      const task = taskRepository.create({
        title,
        description: description ?? null,
        dueDate: new Date(dueDate),
        ownerId,
        status: status ?? 'todo',
      });

      // Save task
      await taskRepository.save(task);

      // Return task
      return {
        message: 'Task created successfully',
        task
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw InternalError('Failed to create task');
    }
  }

  /** List tasks: admin sees all, user sees only own. */
  async findAll(caller: TaskCaller, status?: TaskStatus): Promise<{ message: string, tasks: Task[] }> {
    try {
      const query = taskRepository
        .createQueryBuilder('task')
        .where('task.is_deleted = :isDeleted', { isDeleted: false });

      if (caller.role !== 'admin') {
        query.andWhere('task.owner_id = :ownerId', { ownerId: caller.id });
      }

      if (status) {
        query.andWhere('task.status = :status', { status });
      }

      const tasks = await query.orderBy('task.due_date', 'ASC').getMany();

      const message = !tasks?.length ? 'No tasks found' : 'Tasks retrieved successfully';

      return {
        message,
        tasks,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw InternalError('Failed to retrieve tasks');
    }
  }

  /** Get one task: admin can get any, user only own. */
  async findOne(id: string, caller: TaskCaller): Promise<{ message: string, task: Task }> {
    try {
      const where =
        caller.role === 'admin'
          ? { id, isDeleted: false }
          : { id, ownerId: caller.id, isDeleted: false };

      const task = await taskRepository.findOne({ where });

      if (!task) throw NotFoundError('Task not found');

      return {
        message: 'Task retrieved successfully',
        task,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw InternalError('Failed to retrieve task');
    }
  }

  /** Update task: admin can update any, user only own. */
  async update(id: string, caller: TaskCaller, dto: UpdateTaskDto): Promise<{ message: string, task: Task }> {
    try {
      const { task } = await this.findOne(id, caller);

      const { title, description, status, dueDate } = dto;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status as TaskStatus;
      if (dueDate !== undefined) task.dueDate = new Date(dueDate);

      await taskRepository.save(task);

      return {
        message: 'Task updated successfully',
        task,
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw InternalError('Failed to update task');
    }
  }

  /** Soft delete task: admin can delete any, user only own. */
  async softDelete(id: string, caller: TaskCaller): Promise<{ message: string }> {
    try {
      const { task } = await this.findOne(id, caller);
      task.isDeleted = true;
      await taskRepository.softRemove(task);

      return {
        message: 'Task soft deleted successfully',
      };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw InternalError('Failed to soft delete task');
    }
  }
}
