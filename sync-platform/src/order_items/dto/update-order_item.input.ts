import { CreateOrderItemInput } from './create-order_item.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateOrderItemInput extends PartialType(CreateOrderItemInput) {
  @Field(() => Int)
  id: number;
}
