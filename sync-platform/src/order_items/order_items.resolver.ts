import { Resolver, Query, Mutation, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { OrderItemsService } from './order_items.service';
import { OrderItem } from './entities/order_item.entity';
import { Product } from 'products/entities/product.entity';
import { PrismaService } from 'prisma/prisma.service';
import { CreateOrderItemInput } from './dto/create-order_item.input';
import { UpdateOrderItemInput } from './dto/update-order_item.input';

@Resolver(() => OrderItem)
export class OrderItemsResolver {
  constructor(
    private readonly orderItemsService: OrderItemsService,
    private readonly prisma: PrismaService, // Now used for resolving the product
  ) {}

  @ResolveField(() => Product)
  async product(@Parent() orderItem: OrderItem) {
    return await this.prisma.product.findUnique({
      where: { id: orderItem.productId },
    });
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
  async createOrderItem(@Args('createOrderItemInput') input: CreateOrderItemInput) {
    return await this.orderItemsService.create(input);
  }

  @Mutation(() => OrderItem)
  async updateOrderItem(@Args('updateOrderItemInput') input: UpdateOrderItemInput) {
    return await this.orderItemsService.update(input.id, input);
  }

  @Mutation(() => Boolean)
  async removeOrderItem(@Args('id', { type: () => ID }) id: string) {
    return await this.orderItemsService.remove(id);
  }
}