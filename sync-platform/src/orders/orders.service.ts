import { Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { plainToInstance } from 'class-transformer';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';

@Injectable()
export class OrdersService {
  private readonly nodeName = 'orders';
  private db = admin.database();

  async create(createOrderInput: CreateOrderInput): Promise<Order> {
    const orderRef = this.db.ref(this.nodeName).push();
    const id = orderRef.key;

    const fullData = {
      ...createOrderInput,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await orderRef.set(fullData);
    return plainToInstance(Order, fullData);
  }

  async findAll(): Promise<Order[]> {
    const snapshot = await this.db.ref(this.nodeName).once('value');
    const data = snapshot.val();
    if (!data) return [];

    const list = Object.keys(data).map(key => ({ ...data[key], id: key }));
    return plainToInstance(Order, list);
  }

  async findOne(id: string): Promise<Order> {
    const snapshot = await this.db.ref(`${this.nodeName}/${id}`).once('value');
    if (!snapshot.exists()) throw new NotFoundException(`Order ${id} not found`);
    
    return plainToInstance(Order, { id, ...snapshot.val() });
  }

  async update(id: string, updateOrderInput: UpdateOrderInput): Promise<Order> {
    const ref = this.db.ref(`${this.nodeName}/${id}`);
    const snapshot = await ref.once('value');
    if (!snapshot.exists()) throw new NotFoundException();

    const { id: _, ...dataToUpdate } = updateOrderInput;
    const updateData = { ...dataToUpdate, updatedAt: new Date().toISOString() };

    await ref.update(updateData);
    return plainToInstance(Order, { ...snapshot.val(), ...updateData, id });
  }

  async remove(id: string): Promise<boolean> {
    const ref = this.db.ref(`${this.nodeName}/${id}`);
    const snapshot = await ref.once('value');
    if (!snapshot.exists()) throw new NotFoundException();

    await ref.remove();
    return true;
  }
}