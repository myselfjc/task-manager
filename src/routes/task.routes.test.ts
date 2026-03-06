import request from 'supertest';
import { AppDataSource } from '../config/database';
import { Express } from 'express';

describe('Task routes', () => {
  let app: Express;
  let token: string;
  let taskId: string;

  beforeAll(async () => {
    await AppDataSource.initialize();
    const m = await import('../app');
    app = m.app;

    // Register and login to get token
    await request(app)
      .post('/auth/register')
      .send({ email: 'taskuser@example.com', password: 'password123' })
      .set('Content-Type', 'application/json');

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'taskuser@example.com', password: 'password123' })
      .set('Content-Type', 'application/json');

    token = loginRes.body.token;
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });

  describe('POST /tasks', () => {
    it('returns 401 without token', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({
          title: 'My task',
          dueDate: '2026-12-31',
        })
        .set('Content-Type', 'application/json');

      expect(res.status).toBe(401);
    });

    it('returns 201 and task when valid', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({
          title: 'My task',
          description: 'Some description',
          status: 'todo',
          dueDate: '2026-12-31',
        })
        .set('Content-Type', 'application/json')
        .set(auth());

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('task');
      expect(res.body.task.title).toBe('My task');
      expect(res.body.task.status).toBe('todo');
      expect(res.body.task).toHaveProperty('id');
      taskId = res.body.task.id;
    });

    it('returns 400 when title is missing', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ dueDate: '2026-12-31' })
        .set('Content-Type', 'application/json')
        .set(auth());

      expect(res.status).toBe(400);
    });

    it('returns 400 when dueDate is invalid', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Task', dueDate: 'not-a-date' })
        .set('Content-Type', 'application/json')
        .set(auth());

      expect(res.status).toBe(400);
    });
  });

  describe('GET /tasks', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get('/tasks');
      expect(res.status).toBe(401);
    });

    it('returns 200 and list of tasks', async () => {
      const res = await request(app).get('/tasks').set(auth());
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('tasks');
      expect(Array.isArray(res.body.tasks)).toBe(true);
      expect(res.body.tasks.length).toBeGreaterThanOrEqual(1);
    });

    it('returns 200 with status filter', async () => {
      const res = await request(app)
        .get('/tasks?status=todo')
        .set(auth());
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('tasks');
    });
  });

  describe('GET /tasks/:id', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).get(`/tasks/${taskId}`);
      expect(res.status).toBe(401);
    });

    it('returns 200 and task when found', async () => {
      const res = await request(app).get(`/tasks/${taskId}`).set(auth());
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('task');
      expect(res.body.task.id).toBe(taskId);
    });

    it('returns 404 when task does not exist', async () => {
      const res = await request(app)
        .get('/tasks/00000000-0000-0000-0000-000000000000')
        .set(auth());
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('returns 401 without token', async () => {
      const res = await request(app)
        .patch(`/tasks/${taskId}`)
        .send({ title: 'Updated' })
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(401);
    });

    it('returns 200 and updated task', async () => {
      const res = await request(app)
        .patch(`/tasks/${taskId}`)
        .send({ title: 'Updated title', status: 'in-progress' })
        .set('Content-Type', 'application/json')
        .set(auth());

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('task');
      expect(res.body.task.title).toBe('Updated title');
      expect(res.body.task.status).toBe('in-progress');
    });

    it('returns 404 when task does not exist', async () => {
      const res = await request(app)
        .patch('/tasks/00000000-0000-0000-0000-000000000000')
        .send({ title: 'Updated' })
        .set('Content-Type', 'application/json')
        .set(auth());
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it('returns 401 without token', async () => {
      const res = await request(app).delete(`/tasks/${taskId}`);
      expect(res.status).toBe(401);
    });

    it('returns 204 on success', async () => {
      const res = await request(app).delete(`/tasks/${taskId}`).set(auth());
      expect(res.status).toBe(204);
    });

    it('returns 404 when task does not exist', async () => {
      const res = await request(app)
        .delete(`/tasks/${taskId}`)
        .set(auth());
      expect(res.status).toBe(404);
    });
  });
});
