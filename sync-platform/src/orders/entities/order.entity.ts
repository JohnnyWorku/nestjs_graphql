import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { OrderItem } from 'order_items/entities/order_item.entity';
import { Column, Entity, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Order {
  @PrimaryColumn()
  @Field(() => ID)
  id: string;

  @Column()
  @Field()
  status: string;

  @Field(() => [OrderItem])
  items: OrderItem[];

  @Column()
  @Field(() => Int)
  total: number;

  @Column()
  @Field()
  userId: string;

  @CreateDateColumn({ type: 'timestamp' })
  @Field()
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @Field()
  updatedAt: Date;
}