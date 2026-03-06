import { IsString, IsOptional, IsEnum, IsDateString, MinLength } from 'class-validator';
import { TaskStatus } from '../entities/Task';

export class CreateTaskDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['todo', 'in-progress', 'done'])
  @IsOptional()
  status?: TaskStatus;

  @IsDateString()
  dueDate: string;
}

export class UpdateTaskDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['todo', 'in-progress', 'done'])
  @IsOptional()
  status?: TaskStatus;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
