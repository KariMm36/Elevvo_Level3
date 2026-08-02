import { Request, Response } from 'express';
import { cacheService } from '../services/cacheService';
import { productStore, Product } from '../services/productStore';

const PRODUCTS_CACHE_KEY = 'products:all';
const PRODUCT_CACHE_KEY = (id: number) => `products:${id}`;

// GET /api/products — Cache-Aside Pattern
export async function getProducts(req: Request, res: Response): Promise<void> {
  const start = performance.now();

  // Step 1: Check Redis cache first
  const cached = await cacheService.get<Product[]>(PRODUCTS_CACHE_KEY);

  if (cached) {
    const duration = (performance.now() - start).toFixed(2);
    res.status(200).json({
      status: 200,
      success: true,
      source: 'CACHE',
      responseTime: `${duration}ms`,
      count: cached.length,
      data: cached
    });
    return;
  }

  // Step 2: Cache MISS — simulate database query latency and set cache
  const products = productStore.getAll();

  await cacheService.set(PRODUCTS_CACHE_KEY, products);

  const duration = (performance.now() - start).toFixed(2);
  res.status(200).json({
    status: 200,
    success: true,
    source: 'DATABASE',
    responseTime: `${duration}ms`,
    count: products.length,
    data: products
  });
}

// GET /api/products/:id — Cache-Aside per product
export async function getProductById(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ status: 400, success: false, error: 'Invalid product ID' });
    return;
  }

  const cacheKey = PRODUCT_CACHE_KEY(id);
  const cached = await cacheService.get<Product>(cacheKey);

  if (cached) {
    res.status(200).json({ status: 200, success: true, source: 'CACHE', data: cached });
    return;
  }

  const product = productStore.getById(id);
  if (!product) {
    res.status(404).json({ status: 404, success: false, error: 'Product not found' });
    return;
  }

  await cacheService.set(cacheKey, product);
  res.status(200).json({ status: 200, success: true, source: 'DATABASE', data: product });
}

// POST /api/products — Create & invalidate list cache
export async function createProduct(req: Request, res: Response): Promise<void> {
  const { name, description, price, stock, category } = req.body;
  if (!name || price === undefined || stock === undefined) {
    res.status(400).json({ status: 400, success: false, error: 'name, price, and stock are required' });
    return;
  }

  const newProduct = productStore.create({ name, description: description || '', price, stock, category: category || 'General' });

  // Invalidate the all-products list cache
  await cacheService.invalidate(PRODUCTS_CACHE_KEY);

  res.status(201).json({ status: 201, success: true, message: 'Product created, list cache invalidated', data: newProduct });
}

// PUT /api/products/:id — Update & invalidate caches (Bonus: Active Cache Invalidation)
export async function updateProduct(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ status: 400, success: false, error: 'Invalid product ID' });
    return;
  }

  const updated = productStore.update(id, req.body);
  if (!updated) {
    res.status(404).json({ status: 404, success: false, error: 'Product not found' });
    return;
  }

  // Active Cache Invalidation: purge both specific and list caches
  await cacheService.invalidate(PRODUCT_CACHE_KEY(id));
  await cacheService.invalidate(PRODUCTS_CACHE_KEY);

  res.status(200).json({ status: 200, success: true, message: 'Product updated, caches invalidated', data: updated });
}

// DELETE /api/products/:id — Delete & invalidate caches (Bonus: Active Cache Invalidation)
export async function deleteProduct(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ status: 400, success: false, error: 'Invalid product ID' });
    return;
  }

  const deleted = productStore.delete(id);
  if (!deleted) {
    res.status(404).json({ status: 404, success: false, error: 'Product not found' });
    return;
  }

  // Active Cache Invalidation: purge caches on delete
  await cacheService.invalidate(PRODUCT_CACHE_KEY(id));
  await cacheService.invalidate(PRODUCTS_CACHE_KEY);

  res.status(200).json({ status: 200, success: true, message: `Product ${id} deleted, caches invalidated` });
}
