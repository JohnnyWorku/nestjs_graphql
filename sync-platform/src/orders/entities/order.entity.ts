import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn, Timestamp } from 'typeorm';

@Entity()
@ObjectType()
export class Order {
    @Column()
    @Field((type) => ID)
    id: string;
    
    @Column()
    @Field((type) => Timestamp)
    createdAt: Timestamp;
  
    @Column()
    @Field()
    status: string;
  
    @Column()
    @Field((type) => Int)
    total: number;
  
    @Column()
    @Field((type) => Timestamp)
    updatedAt: Timestamp;

    @Column()
    @Field()
    userId: string;
  
    // @ManyToOne(() => Owner, (owner) => owner.pets)
    // @Field((type) => Owner)
    // owner: Owner;
}
