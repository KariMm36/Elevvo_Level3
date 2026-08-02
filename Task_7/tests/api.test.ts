import request from 'supertest';
import { app } from '../src/app';

describe('Task 7 API — Integration Tests (Jest + Supertest)', () => {

  // ─── Root ───────────────────────────────────────────
  describe('GET /', () => {
    it('should return 200 with welcome message and available routes', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.availableRoutes).toBeDefined();
      expect(Array.isArray(res.body.availableRoutes)).toBe(true);
    });
  });

  // ─── Health Check ───────────────────────────────────
  describe('GET /api/health', () => {
    it('should return 200 with health status and uptime', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.uptime).toBeDefined();
    });
  });

  // ─── GET all tasks ──────────────────────────────────
  describe('GET /api/tasks', () => {
    it('should return 200 with an array of tasks', async () => {
      const res = await request(app).get('/api/tasks');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ─── GET task by ID ─────────────────────────────────
  describe('GET /api/tasks/:id', () => {
    it('should return 200 and the correct task', async () => {
      const res = await request(app).get('/api/tasks/1');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(1);
    });

    it('should return 404 for a non-existent task', async () => {
      const res = await request(app).get('/api/tasks/9999');
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── POST create task ───────────────────────────────
  describe('POST /api/tasks', () => {
    it('should create a task and return 201 with created task data', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .send({ title: 'Deploy to production with CI/CD' });
      expect(res.statusCode).toBe(201);
      expect(res.body.data.title).toBe('Deploy to production with CI/CD');
      expect(res.body.data.completed).toBe(false);
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app).post('/api/tasks').send({});
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  // ─── PUT update task ────────────────────────────────
  describe('PUT /api/tasks/:id', () => {
    it('should update a task and return 200', async () => {
      const res = await request(app)
        .put('/api/tasks/1')
        .send({ completed: true });
      expect(res.statusCode).toBe(200);
      expect(res.body.data.completed).toBe(true);
    });

    it('should return 404 for updating a non-existent task', async () => {
      const res = await request(app)
        .put('/api/tasks/9999')
        .send({ title: 'Ghost task' });
      expect(res.statusCode).toBe(404);
    });
  });

  // ─── DELETE task ────────────────────────────────────
  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task and return 200', async () => {
      const res = await request(app).delete('/api/tasks/3');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when deleting an already deleted or non-existent task', async () => {
      const res = await request(app).delete('/api/tasks/9999');
      expect(res.statusCode).toBe(404);
    });
  });

});
