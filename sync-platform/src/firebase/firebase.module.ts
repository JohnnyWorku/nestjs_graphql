import { Module, Global } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';
import { join } from 'path';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    FirebaseService,
    {
      provide: 'FIREBASE_DB',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const keyPath = configService.get<string>('FIREBASE_KEY_PATH');
        const dbUrl = configService.get<string>('FIREBASE_DATABASE_URL');

        if (!keyPath || !dbUrl) {
          throw new Error('Firebase configuration missing in .env');
        }

        // Initialize only if no apps exist (standard practice)
        if (admin.apps.length === 0) {
          admin.initializeApp({
            credential: admin.credential.cert(join(process.cwd(), keyPath)),
            databaseURL: dbUrl,
          });
        }
        
        return admin.database();
      },
    },
  ],
  exports: [FirebaseService, 'FIREBASE_DB'],
})
export class FirebaseModule {}