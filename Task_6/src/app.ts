import express, { Request, Response } from 'express';
import productRoutes from './routes/productRoutes';

export const app = express();
const PORT = process.env.PORT || 3007;

app.use(express.json());
app.use('/api/products', productRoutes);

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    success: true,
    message: 'Welcome to Task 6: High-Performance Caching & Active Cache Invalidation with Redis',
    strategy: 'Cache-Aside Pattern with Active Invalidation on Mutations',
    availableRoutes: [
      { method: 'GET', path: '/api/products', description: 'Get all products (Cache-Aside: Redis → DB with 1hr TTL)' },
      { method: 'GET', path: '/api/products/:id', description: 'Get product by ID (Cache-Aside per product)' },
      { method: 'POST', path: '/api/products', description: 'Create product (Invalidates list cache)' },
      { method: 'PUT', path: '/api/products/:id', description: 'Update product (Invalidates item + list cache)' },
      { method: 'DELETE', path: '/api/products/:id', description: 'Delete product (Invalidates item + list cache)' }
    ]
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Task 6 Redis Cache API running on http://localhost:${PORT}`);
    console.log(` Strategy: Cache-Aside Pattern (Redis → DB fallback)`);
    console.log(` Cache TTL: 3600 seconds (1 hour)`);
    console.log(` Active Cache Invalidation: ENABLED on PUT/DELETE`);
    console.log(`=======================================================`);
  });
}
