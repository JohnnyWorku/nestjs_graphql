import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { SyncModule } from './sync/sync.module';
import { PrismaService } from './prisma/prisma.service';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    FirebaseModule,
    SyncModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}   
