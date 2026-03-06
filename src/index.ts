import 'reflect-metadata';
import dotenv from 'dotenv';

dotenv.config();

import { app } from './app';
import { AppDataSource } from './config/database';

const PORT = process.env.PORT ?? 3000;

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established.');
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
