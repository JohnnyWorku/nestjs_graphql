import { InputType, Int, Field, ID } from '@nestjs/graphql';
import { Column, Timestamp } from 'typeorm';
import { IsEnum, IsString, IsNotEmpty, IsISO8601, IsNumber } from 'class-validator';

@InputType()
export class CreateOrderInput {
  @IsString()
  @IsNotEmpty()
  @Field((type) => ID)
  id: string;
  
  @IsNotEmpty()
  @IsISO8601()
  @Field((type) => Timestamp)
  createdAt: Timestamp;

  @Field()
  @IsEnum(['PENDING', 'CONFIRMED', 'CANCELED'], {
    message: 'valid status required.',
  })
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED';

  @IsNumber()
  @IsNotEmpty()
  @Field((type) => Int)
  total: number;

  @IsNotEmpty()
  @IsISO8601()
  @Field((type) => Timestamp)
  updatedAt: Timestamp;

  @IsString()
  @IsNotEmpty()
  @Field()
  userId: string;
  // @IsString()
  // @IsNotEmpty()
  // name: string;

  // @IsEmail()
  // email: string;

  // @IsEnum(['INTERN', 'ENGINEER', 'ADMIN'], {
  //   message: 'valid role required.',
  // })
  // role: 'INTERN' | 'ENGINEER' | 'ADMIN';
}
