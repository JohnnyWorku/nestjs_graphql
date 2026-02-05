import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { OrderItemsService } from './order_items.service';
import { OrderItem } from './entities/order_item.entity';
import { CreateOrderItemInput } from './dto/create-order_item.input';
import { UpdateOrderItemInput } from './dto/update-order_item.input';

@Resolver(() => OrderItem)
export class OrderItemsResolver {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Mutation(() => OrderItem)
  async createOrderItem(@Args('createOrderItemInput') createOrderItemInput: CreateOrderItemInput) {
    return await this.orderItemsService.create(createOrderItemInput);
  }

  @Query(() => [OrderItem], { name: 'orderItems' })
  async findAll() {
    return await this.orderItemsService.findAll();
  }

  @Query(() => OrderItem, { name: 'orderItem' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return await this.orderItemsService.findOne(id);
  }

  @Mutation(() => OrderItem)
  async updateOrderItem(@Args('updateOrderItemInput') updateOrderItemInput: UpdateOrderItemInput) {
    return await this.orderItemsService.update(updateOrderItemInput.id, updateOrderItemInput);
  }

  @Mutation(() => Boolean) // Standard practice to return boolean on removal
  async removeOrderItem(@Args('id', { type: () => ID }) id: string) {
    return await this.orderItemsService.remove(id);
  }
}