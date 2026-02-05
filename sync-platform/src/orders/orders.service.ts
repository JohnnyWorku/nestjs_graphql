import { Injectable, NotFoundException, Inject } from '@nestjs/common'; // Added Inject
import * as admin from 'firebase-admin';
import { plainToInstance } from 'class-transformer';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';

@Injectable()
export class OrdersService {
  private readonly nodeName = 'orders';

  constructor(
    // Injecting the DB token forces NestJS to wait for Firebase initialization
    @Inject('FIREBASE_DB') private readonly db: admin.database.Database,
  ) {}

  async create(createOrderInput: CreateOrderInput): Promise<Order> {
    // Get the custom ID you provided in the mutation
    const id = createOrderInput.id;

    // Tell Firebase: "I want to save inside a folder named exactly this ID"
    const orderRef = this.db.ref(this.nodeName).child(id);

    // Prepare the full data object
    const fullData = {
      ...createOrderInput,
      id: id, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save it to the database
    await orderRef.set(fullData);

    // Return the clean object
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