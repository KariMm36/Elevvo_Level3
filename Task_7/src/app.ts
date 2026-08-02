import express, { Request, Response } from 'express';

export const app = express();
const PORT = process.env.PORT || 3009;

app.use(express.json());

// In-memory task list for demonstration
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const tasks: Task[] = [
  { id: 1, title: 'Build Docker multi-stage image', completed: true },
  { id: 2, title: 'Write Jest + Supertest tests', completed: true },
  { id: 3, title: 'Configure GitHub Actions CI pipeline', completed: true }
];

// Root
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    success: true,
    message: 'Welcome to Task 7: Dockerized API with CI/CD Pipeline',
    availableRoutes: [
      { method: 'GET', path: '/', description: 'API documentation' },
      { method: 'GET', path: '/api/tasks', description: 'Get all tasks' },
      { method: 'GET', path: '/api/tasks/:id', description: 'Get task by ID' },
      { method: 'POST', path: '/api/tasks', description: 'Create task' },
      { method: 'PUT', path: '/api/tasks/:id', description: 'Update task' },
      { method: 'DELETE', path: '/api/tasks/:id', description: 'Delete task' },
      { method: 'GET', path: '/api/health', description: 'Container health check' }
    ]
  });
});

// Health Check endpoint (used by Docker health checks)
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    success: true,
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`
  });
});

// GET all tasks
app.get('/api/tasks', (req: Request, res: Response) => {
  res.status(200).json({ status: 200, success: true, count: tasks.length, data: tasks });
});

// GET task by ID
app.get('/api/tasks/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find(t => t.id === id);
  if (!task) {
    res.status(404).json({ status: 404, success: false, error: 'Task not found' });
    return;
  }
  res.status(200).json({ status: 200, success: true, data: task });
});

// POST create task
app.post('/api/tasks', (req: Request, res: Response) => {
  const { title } = req.body;
  if (!title) {
    res.status(400).json({ status: 400, success: false, error: 'Title is required' });
    return;
  }
  const newTask: Task = {
    id: tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
    title,
    completed: false
  };
  tasks.push(newTask);
  res.status(201).json({ status: 201, success: true, data: newTask });
});

// PUT update task
app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find(t => t.id === id);
  if (!task) {
    res.status(404).json({ status: 404, success: false, error: 'Task not found' });
    return;
  }
  if (req.body.title !== undefined) task.title = req.body.title;
  if (req.body.completed !== undefined) task.completed = req.body.completed;
  res.status(200).json({ status: 200, success: true, data: task });
});

// DELETE task
app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) {
    res.status(404).json({ status: 404, success: false, error: 'Task not found' });
    return;
  }
  tasks.splice(idx, 1);
  res.status(200).json({ status: 200, success: true, message: `Task ${id} deleted` });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Task 7 Dockerized API running on http://localhost:${PORT}`);
    console.log(` Multi-Stage Docker: CONFIGURED`);
    console.log(` Jest + Supertest Tests: READY`);
    console.log(` GitHub Actions CI Pipeline: CONFIGURED`);
    console.log(`=======================================================`);
  });
}
