import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
@ObjectType()
export class OrderItem {
  @PrimaryColumn()
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  orderId: string;

  @Column()
  @Field()
  productId: string;

  @Column()
  @Field(() => Int)
  qty: number;

  @Column()
  @Field(() => Int)
  unitPrice: number;
}