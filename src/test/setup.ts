/**
 * Runs before any test file. Sets env so tests use test DB and NODE_ENV=test.
 * Must run before config/database or app are imported.
 */
import dotenv from 'dotenv';

dotenv.config();

process.env.NODE_ENV = 'test';
if (!process.env.DB_NAME_TEST) {
  process.env.DB_NAME = process.env.DB_NAME ?? 'task_manager_test';
} else {
  process.env.DB_NAME = process.env.DB_NAME_TEST;
}
