import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Mutation(() => Order)
  async createOrder(@Args('createOrderInput') createOrderInput: CreateOrderInput) {
    return await this.ordersService.create(createOrderInput);
  }

  @Query(() => [Order], { name: 'orders' })
  async findAll() {
    return await this.ordersService.findAll();
  }

  @Query(() => Order, { name: 'order' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return await this.ordersService.findOne(id);
  }

  @Mutation(() => Order)
  async updateOrder(@Args('updateOrderInput') updateOrderInput: UpdateOrderInput) {
    return await this.ordersService.update(updateOrderInput.id, updateOrderInput);
  }

  @Mutation(() => Boolean)
  async removeOrder(@Args('id', { type: () => ID }) id: string) {
    return await this.ordersService.remove(id);
  }
}