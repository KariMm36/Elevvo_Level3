export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

class ProductStore {
  private products: Product[] = [
    { id: 1, name: 'Gaming Laptop', description: 'High performance gaming laptop', price: 1200, stock: 5, category: 'Electronics' },
    { id: 2, name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 30, stock: 50, category: 'Accessories' },
    { id: 3, name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard', price: 90, stock: 20, category: 'Accessories' },
    { id: 4, name: '4K Monitor', description: '27-inch 4K display', price: 450, stock: 10, category: 'Electronics' }
  ];

  getAll(): Product[] {
    return this.products;
  }

  getById(id: number): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  update(id: number, updates: Partial<Omit<Product, 'id'>>): Product | undefined {
    const product = this.getById(id);
    if (!product) return undefined;
    Object.assign(product, updates);
    return product;
  }

  delete(id: number): boolean {
    const idx = this.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.products.splice(idx, 1);
    return true;
  }

  create(data: Omit<Product, 'id'>): Product {
    const newProduct: Product = {
      id: Math.max(...this.products.map(p => p.id)) + 1,
      ...data
    };
    this.products.push(newProduct);
    return newProduct;
  }
}

export const productStore = new ProductStore();
