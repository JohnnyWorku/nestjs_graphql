import { ObjectType, Field, Int, ID, Float } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class OrderItem {
  @Field((type) => ID)
  id: string;

  @Column()
  @Field((type) => ID)
  orderId: string;

  @Column()
  @Field((type) => ID)
  productId: string;

  @Column()
  @Field((type) => Int)
  qty: number;

  @Column()
  @Field((type) => Int)
  unitPrice: number;

  // @ManyToOne(() => Owner, (owner) => owner.pets)
  // @Field((type) => Owner)
  // owner: Owner;
}
