import { InputType, Int, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateOrderItemInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  @Field(() => Int)
  qty: number;

  @IsNotEmpty()
  @IsNumber()
  @Field(() => Int)
  unitPrice: number;
}
