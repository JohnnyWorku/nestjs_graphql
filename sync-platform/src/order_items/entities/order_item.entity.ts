import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Product } from 'products/entities/product.entity';
import { Entity, PrimaryColumn, Column } from 'typeorm';

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

  @Field(() => Product, { nullable: true })
  product?: Product;
}