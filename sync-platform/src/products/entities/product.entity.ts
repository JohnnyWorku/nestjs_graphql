import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Column, Entity, Timestamp } from 'typeorm';

@Entity()
@ObjectType()
export class Product {
  @Field((type) => ID)
  id: string;
  
  @Column()
  @Field((type) => Timestamp)
  createdAt: Timestamp;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field((type) => Int)
  price: number;

  @Column()
  @Field()
  sku: string;

  @Column()
  @Field((type) => Int)
  stock: number;

  @Column()
  @Field((type) => Timestamp)
  updatedAt: Timestamp;
  
    // @ManyToOne(() => Owner, (owner) => owner.pets)
    // @Field((type) => Owner)
    // owner: Owner;
}
