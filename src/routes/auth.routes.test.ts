import request from 'supertest';
import { AppDataSource } from '../config/database';
import { Express } from 'express';

describe('Auth routes', () => {
  let app: Express;

  beforeAll(async () => {
    await AppDataSource.initialize();
    const m = await import('../app');
    app = m.app;
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe('POST /auth/register', () => {
    const validBody = { email: 'test@example.com', password: 'password123' };

    it('returns 201 and user + token when valid', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send(validBody)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe(validBody.email);
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
    });

    it('returns 400 when email is invalid', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'not-an-email', password: 'password123' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 when password is too short', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ email: 'other@example.com', password: '12345' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns 409 when email already registered', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send(validBody)
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /auth/login', () => {
    it('returns 200 and user + token when valid', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body).toHaveProperty('token');
    });

    it('returns 401 when password is wrong', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns 401 when email does not exist', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('returns 400 when body is invalid', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({ email: 'not-an-email' })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(400);
    });
  });
});
