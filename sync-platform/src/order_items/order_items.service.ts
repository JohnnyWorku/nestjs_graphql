import { Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { plainToInstance } from 'class-transformer';
import { OrderItem } from './entities/order_item.entity';
import { CreateOrderItemInput } from './dto/create-order_item.input';
import { UpdateOrderItemInput } from './dto/update-order_item.input';

@Injectable()
export class OrderItemsService {
  private readonly nodeName = 'order_items';
  private db = admin.database();

  async create(createOrderItemInput: CreateOrderItemInput): Promise<OrderItem> {
    const itemsRef = this.db.ref(this.nodeName).push();
    const id = itemsRef.key;

    const fullData = { ...createOrderItemInput, id };
    await itemsRef.set(fullData);
    
    return plainToInstance(OrderItem, fullData);
  }

  async findAll(): Promise<OrderItem[]> {
    const snapshot = await this.db.ref(this.nodeName).once('value');
    const data = snapshot.val();
    if (!data) return [];

    const list = Object.keys(data).map(key => ({ ...data[key], id: key }));
    return plainToInstance(OrderItem, list);
  }

  async findOne(id: string): Promise<OrderItem> {
    const snapshot = await this.db.ref(`${this.nodeName}/${id}`).once('value');
    if (!snapshot.exists()) throw new NotFoundException(`OrderItem ${id} not found`);
    
    return plainToInstance(OrderItem, { id, ...snapshot.val() });
  }

  async update(id: string, updateOrderItemInput: UpdateOrderItemInput): Promise<OrderItem> {
    const ref = this.db.ref(`${this.nodeName}/${id}`);
    const snapshot = await ref.once('value');
    if (!snapshot.exists()) throw new NotFoundException();

    const { id: _, ...dataToUpdate } = updateOrderItemInput;
    await ref.update(dataToUpdate);

    return plainToInstance(OrderItem, { ...snapshot.val(), ...dataToUpdate, id });
  }

  async remove(id: string): Promise<boolean> {
    const ref = this.db.ref(`${this.nodeName}/${id}`);
    const snapshot = await ref.once('value');
    if (!snapshot.exists()) throw new NotFoundException();

    await ref.remove();
    return true;
  }
}