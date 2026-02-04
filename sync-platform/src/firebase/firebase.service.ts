import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private dbInstance: admin.database.Database | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    this.logger.log('FirebaseService → onModuleInit started');

    const keyPath = this.configService.get<string>('FIREBASE_KEY_PATH');
    const databaseURL = this.configService.get<string>('FIREBASE_DATABASE_URL');

    if (!keyPath) {
      this.logger.error('Missing FIREBASE_KEY_PATH in environment');
      throw new Error('FIREBASE_KEY_PATH is required');
    }

    if (!databaseURL) {
      this.logger.error('Missing FIREBASE_DATABASE_URL in environment');
      throw new Error('FIREBASE_DATABASE_URL is required');
    }

    if (admin.apps.length > 0) {
      this.logger.log('Firebase already initialized (likely hot-reload)');
      this.dbInstance = admin.database();
      return;
    }

    const fullKeyPath = join(process.cwd(), keyPath);
    this.logger.log(`Loading service account from: ${fullKeyPath}`);

    try {
      admin.initializeApp({
        credential: admin.credential.cert(fullKeyPath),
        databaseURL,
      });

      this.dbInstance = admin.database();
      this.logger.log('Firebase Admin SDK initialized successfully ✓');
    } catch (error) {
      this.logger.error('Firebase initialization failed', error);
      throw error; 
    }
  }

  get db(): admin.database.Database {
    if (!this.dbInstance) {
      throw new Error(
        'Firebase DB not initialized. ' +
        'Check earlier logs for FIREBASE_KEY_PATH / credential errors.',
      );
    }
    return this.dbInstance;
  }
}