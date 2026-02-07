import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { plainToInstance } from 'class-transformer';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';

@Injectable()
export class ProductsService {
  private readonly collectionName = 'products';

  constructor(
    @Inject('FIREBASE_DB') private readonly db: admin.database.Database,
  ) {}

  // Helper to ensure Dates are actual Date objects for GraphQL
  private mapToProduct(data: any): Product {
    return plainToInstance(Product, {
      ...data,
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
    });
  }

  async create(createProductInput: CreateProductInput): Promise<Product> {
    // Pick the ID you sent from the frontend
    const id = createProductInput.id; 

    // Point to a folder with that EXACT name
    const productRef = this.db.ref(this.collectionName).child(id);

    // Prepare the data
    const fullProductData = {
      ...createProductInput,
      id: id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save it
    await productRef.set(fullProductData);
    
    return this.mapToProduct(fullProductData);
  }

  async findAll(search?: string): Promise<Product[]> {
    const snapshot = await this.db.ref(this.collectionName).once('value');
    const data = snapshot.val();
    if (!data) return [];
    
    const allProducts = Object.keys(data).map((key) => {
      const item = data[key];
      return this.mapToProduct({ ...item, id: key });
    });

    if (search) {
      const filtered = allProducts.filter((product) => product.name === search);

      if (filtered.length === 0) {
        throw new NotFoundException(`No products found with name: ${search}`)
      }

      return filtered;
    }

    return allProducts;
  }

  async findOne(id: string): Promise<Product> {
    const snapshot = await this.db.ref(`${this.collectionName}/${id}`).once('value');
    if (!snapshot.exists()) {
       throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return this.mapToProduct({ id, ...snapshot.val() });
  }

  async update(id: string, updateProductInput: UpdateProductInput): Promise<Product> {
    const ref = this.db.ref(`${this.collectionName}/${id}`);
    const snapshot = await ref.once('value');
    
    if (!snapshot.exists()) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const { id: _, ...dataToUpdate } = updateProductInput;

    const updateData = {
      ...dataToUpdate,
      updatedAt: new Date().toISOString(),
    };
    
    await ref.update(updateData);
    const updatedResult = { ...snapshot.val(), ...updateData, id };

    return this.mapToProduct(updatedResult);
  }

  async remove(id: string): Promise<boolean> {
    const ref = this.db.ref(`${this.collectionName}/${id}`);
    const snapshot = await ref.once('value');
    if (!snapshot.exists()) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    await ref.remove();
    return true;
  }
}