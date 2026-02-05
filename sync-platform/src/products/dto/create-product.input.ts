import { InputType, Int, Field, ID } from '@nestjs/graphql';
import { IsISO8601, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Timestamp } from 'typeorm';

@InputType()
export class CreateProductInput {
  @IsNotEmpty()
  @IsString()
  @Field((type) => ID)
  id: string;
  
  @IsNotEmpty()
  @IsISO8601()
  @Field((type) => Timestamp)
  createdAt: Timestamp;

  @IsNotEmpty()
  @IsString()
  @Field()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Field((type) => Int)
  price: number;

  @IsString()
  @IsNotEmpty()
  @Field()
  sku: string;

  @IsNotEmpty()
  @IsNumber()
  @Field((type) => Int)
  stock: number;

  @IsNotEmpty()
  @IsISO8601()
  @Field((type) => Timestamp)
  updatedAt: Timestamp;
}
