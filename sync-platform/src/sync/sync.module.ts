import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [FirebaseModule],
  controllers: [SyncController],
  providers: [
    SyncService,
    PrismaService, 
  ],
})
export class SyncModule {}