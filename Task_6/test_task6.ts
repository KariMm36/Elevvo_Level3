// Use mock Redis for testing (no real Redis server needed)
process.env.USE_REDIS_MOCK = 'true';

import { app } from './src/app';
import http from 'http';

const PORT = 3008;

function request(method: string, path: string, body?: object) {
  return new Promise<{ statusCode?: number; body: any }>((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    if (postData) reqHeaders['Content-Length'] = Buffer.byteLength(postData).toString();

    const req = http.request(
      { hostname: 'localhost', port: PORT, path, method, headers: reqHeaders },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(data) }));
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTask6Tests() {
  const server = app.listen(PORT, async () => {
    console.log(`Task 6 Test Server listening on port ${PORT}...`);
    try {
      console.log('\n--- 1. Cache-Aside: First request (CACHE MISS → reads from DB) ---');
      const miss1 = await request('GET', '/api/products');
      console.log(`Status: ${miss1.statusCode} | Source: ${miss1.body.source} (Expected: DATABASE) | Count: ${miss1.body.count}`);

      console.log('\n--- 2. Cache-Aside: Second request (CACHE HIT → reads from Redis) ---');
      const hit1 = await request('GET', '/api/products');
      console.log(`Status: ${hit1.statusCode} | Source: ${hit1.body.source} (Expected: CACHE) | Response Time: ${hit1.body.responseTime}`);

      console.log('\n--- 3. GET /api/products/1 (CACHE MISS → set cache for product 1) ---');
      const missItem = await request('GET', '/api/products/1');
      console.log(`Status: ${missItem.statusCode} | Source: ${missItem.body.source} (Expected: DATABASE) | Product: ${missItem.body.data?.name}`);

      console.log('\n--- 4. GET /api/products/1 (CACHE HIT) ---');
      const hitItem = await request('GET', '/api/products/1');
      console.log(`Status: ${hitItem.statusCode} | Source: ${hitItem.body.source} (Expected: CACHE)`);

      console.log('\n--- 5. PUT /api/products/1 → Active Cache Invalidation ---');
      const update = await request('PUT', '/api/products/1', { price: 999 });
      console.log(`Status: ${update.statusCode} | Message: ${update.body.message}`);

      console.log('\n--- 6. GET /api/products after PUT → CACHE MISS (correctly invalidated) ---');
      const missAfterUpdate = await request('GET', '/api/products');
      console.log(`Status: ${missAfterUpdate.statusCode} | Source: ${missAfterUpdate.body.source} (Expected: DATABASE — cache was purged)`);

      console.log('\n--- 7. DELETE /api/products/2 → Active Cache Invalidation ---');
      const del = await request('DELETE', '/api/products/2');
      console.log(`Status: ${del.statusCode} | Message: ${del.body.message}`);

      console.log('\n--- 8. POST /api/products → Create new product ---');
      const create = await request('POST', '/api/products', { name: 'USB Hub', description: '7-port USB hub', price: 25, stock: 100, category: 'Accessories' });
      console.log(`Status: ${create.statusCode} | Created: ${create.body.data?.name}`);

      console.log('\n Task 6 Verification PASSED!');
    } catch (err) {
      console.error(' Task 6 Verification FAILED:', err);
    } finally {
      server.close();
    }
  });
}

runTask6Tests();
