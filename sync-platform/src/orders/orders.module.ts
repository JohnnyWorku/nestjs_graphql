import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';
import { OrderItemsService } from 'order_items/order_items.service';
import { OrderItemsResolver } from 'order_items/order_items.resolver';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [
    OrdersService, 
    OrdersResolver, 
    OrderItemsService, 
    OrderItemsResolver, 
    PrismaService
  ],
  exports: [OrdersService, OrderItemsService]
})
export class OrdersModule {}