import { Test, TestingModule } from '@nestjs/testing';
import { OrderItemsResolver } from './order_items.resolver';
import { OrderItemsService } from './order_items.service';

describe('OrderItemsResolver', () => {
  let resolver: OrderItemsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderItemsResolver, OrderItemsService],
    }).compile();

    resolver = module.get<OrderItemsResolver>(OrderItemsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
