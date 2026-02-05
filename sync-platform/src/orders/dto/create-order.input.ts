import { InputType, Int, Field } from '@nestjs/graphql';
import { IsEnum, IsString, IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class CreateOrderInput {
  @IsNotEmpty()
  @IsString()
  @Field()
  id: string;

  @Field()
  @IsEnum(['PENDING', 'CONFIRMED', 'CANCELED'], { message: 'valid status required.' })
  status: string;

  @IsNumber()
  @IsNotEmpty()
  @Field(() => Int)
  total: number;

  @IsString()
  @IsNotEmpty()
  @Field()
  userId: string;
}