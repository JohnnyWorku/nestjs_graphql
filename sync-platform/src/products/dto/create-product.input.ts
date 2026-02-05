import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateProductInput {
  @IsNotEmpty()
  @IsString()
  @Field()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Field(() => Int)
  price: number;

  @IsString()
  @IsNotEmpty()
  @Field()
  sku: string;

  @IsNotEmpty()
  @IsNumber()
  @Field(() => Int)
  stock: number;
}