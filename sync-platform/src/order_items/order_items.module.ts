import { Module } from '@nestjs/common';
import { OrderItemsService } from './order_items.service';
import { OrderItemsResolver } from './order_items.resolver';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [OrderItemsResolver, OrderItemsService, PrismaService],
})
export class OrderItemsModule {}
