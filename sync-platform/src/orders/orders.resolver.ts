import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent, registerEnumType } from '@nestjs/graphql';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderInput } from './dto/create-order.input';
import { UpdateOrderInput } from './dto/update-order.input';
import { PrismaService } from 'prisma/prisma.service';
import { OrderItem } from 'order_items/entities/order_item.entity';


export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// registering the enum to graphql
registerEnumType(OrderStatus, { name: 'OrderStatus' });

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService, private prisma: PrismaService) {}

  @Mutation(() => Order)
  async createOrder(@Args('createOrderInput') createOrderInput: CreateOrderInput) {
    return await this.ordersService.create(createOrderInput);
  }

  @Query(() => [Order], { name: 'orders' })
  async findAll(
    @Args('userId', { type: () => String}) userId: string,
    @Args('status', { type: () => OrderStatus}) status: OrderStatus,
  ): Promise<Order[]> {
    return await this.ordersService.findAll(userId, status);
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

  @ResolveField(() => [OrderItem])
  async items(@Parent() order: Order) {
    return this.prisma.orderItem.findMany({
      where: { orderId: order.id },
    });
  }
}