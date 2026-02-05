import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Product {
  @PrimaryColumn()
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  name: string;

  @Column()
  @Field(() => Int)
  price: number;

  @Column()
  @Field()
  sku: string;

  @Column()
  @Field(() => Int)
  stock: number;

  @CreateDateColumn({ type: 'timestamp' })
  @Field()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @Field()
  updatedAt: Date;
}