import { Injectable } from '@nestjs/common';
import { CreateOrderItemInput } from './dto/create-order_item.input';
import { UpdateOrderItemInput } from './dto/update-order_item.input';

@Injectable()
export class OrderItemsService {
  create(createOrderItemInput: CreateOrderItemInput) {
    return 'This action adds a new orderItem';
  }

  findAll() {
    return `This action returns all orderItems`;
  }

  findOne(id: number) {
    return `This action returns a #${id} orderItem`;
  }

  update(id: number, updateOrderItemInput: UpdateOrderItemInput) {
    return `This action updates a #${id} orderItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} orderItem`;
  }
}
