import { InputType, Int, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateOrderItemInput {
  @IsString()
  @IsNotEmpty()
  @Field((type) => ID)
  id: string;
  
  @IsString()
  @IsNotEmpty()
  @Field((type) => ID)
  orderId: string;

  @IsString()
  @IsNotEmpty()
  @Field((type) => ID)
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  @Field((type) => Int)
  qty: number;

  @IsNotEmpty()
  @IsNumber()
  @Field((type) => Int)
  unitPrice: number;
}
