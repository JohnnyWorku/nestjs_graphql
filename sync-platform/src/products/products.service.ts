import { Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { plainToInstance } from 'class-transformer';
import { Product } from './entities/product.entity';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';

@Injectable()
export class ProductsService {
  private readonly collectionName = 'products';
  private db = admin.database();

  async create(createProductInput: CreateProductInput): Promise<Product> {
    const productsRef = this.db.ref(this.collectionName);
    const newProductRef = productsRef.push();
    const newId = newProductRef.key;

    const fullProductData = {
      ...createProductInput,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await newProductRef.set(fullProductData);
    
    // plainToInstance converts the ISO strings into real Date objects for TypeScript
    return plainToInstance(Product, fullProductData);
  }

  async findAll(): Promise<Product[]> {
    const snapshot = await this.db.ref(this.collectionName).once('value');
    const data = snapshot.val();
    if (!data) return [];
    
    const list = Object.keys(data).map((key) => ({ 
      ...data[key],
      id: key 
    }));

    return plainToInstance(Product, list);
  }

  async findOne(id: string): Promise<Product> {
    const snapshot = await this.db.ref(`${this.collectionName}/${id}`).once('value');
    if (!snapshot.exists()) {
       throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return plainToInstance(Product, { id, ...snapshot.val() });
  }

  async update(id: string, updateProductInput: UpdateProductInput): Promise<Product> {
    const ref = this.db.ref(`${this.collectionName}/${id}`);
    const snapshot = await ref.once('value');
    
    if (!snapshot.exists()) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Destructure to ensure we don't accidentally update the 'id' field
    const { id: _, ...dataToUpdate } = updateProductInput;

    const updateData = {
      ...dataToUpdate,
      updatedAt: new Date().toISOString(),
    };
    
    await ref.update(updateData);
    const updatedResult = { ...snapshot.val(), ...updateData, id };

    return plainToInstance(Product, updatedResult);
  }

  async remove(id: string): Promise<boolean> {
    const ref = this.db.ref(`${this.collectionName}/${id}`);
    const snapshot = await ref.once('value');
    if (!snapshot.exists()) throw new NotFoundException();

    await ref.remove();
    return true;
  }
}