import request from 'supertest';
import { AppDataSource } from '../config/database';
import { Express } from 'express';

describe('GET /health', () => {
  let app: Express;

  beforeAll(async () => {
    await AppDataSource.initialize();
    const m = await import('../app');
    app = m.app;
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  it('returns 200 and { status: "ok" }', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
