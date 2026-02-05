import { IsNotEmpty } from 'class-validator';
import { CreateOrderItemInput } from './create-order_item.input';
import { InputType, Field, Int, PartialType, ID } from '@nestjs/graphql';

@InputType()
export class UpdateOrderItemInput extends PartialType(CreateOrderItemInput) {
  @Field(() => ID)
  @IsNotEmpty()
  id: string;
}