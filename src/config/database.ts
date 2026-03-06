import 'dotenv/config';
import path from 'path';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Task } from '../entities/Task';

const migrationsDir = path.join(__dirname, '..', 'migrations');
const migrationsExt = path.extname(__filename) === '.ts' ? 'ts' : 'js';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '3306', 10),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'task_manager',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Task],
  migrations: [`${migrationsDir}/*.${migrationsExt}`],
});
