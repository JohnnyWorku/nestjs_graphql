import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Product } from 'products/entities/product.entity';
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

  @Field(() => Product) // This is your @ManyToOne equivalent!
  product: Product;

  @Column()
  @Field(() => Int)
  qty: number;

  @Column()
  @Field(() => Int)
  unitPrice: number;
}