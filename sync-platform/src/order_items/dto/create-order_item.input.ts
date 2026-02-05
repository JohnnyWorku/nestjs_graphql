import { InputType, Int, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateOrderItemInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  id: string;
  
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
  @Field((type) => Int)
  qty: number;

  @IsNotEmpty()
  @IsNumber()
  @Field((type) => Int)
  unitPrice: number;
}
