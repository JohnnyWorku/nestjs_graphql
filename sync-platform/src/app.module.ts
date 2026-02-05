import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { SyncModule } from './sync/sync.module';
import { PrismaService } from './prisma/prisma.service';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemsModule } from './order_items/order_items.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'inventory_sync',
      autoLoadEntities: true,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),

    FirebaseModule,
    SyncModule,
    ProductsModule,
    OrdersModule,
    OrderItemsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}   
