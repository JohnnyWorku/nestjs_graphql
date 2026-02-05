import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
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