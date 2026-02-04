import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private dbInstance: admin.database.Database | null = null;

  constructor(private configService: ConfigService) {}

  async onModuleInit(): Promise<void> {

    const keyPath = this.configService.get<string>('FIREBASE_KEY_PATH');
    const databaseURL = this.configService.get<string>('FIREBASE_DATABASE_URL');

    if (!keyPath) {
      throw new Error('FIREBASE_KEY_PATH is required');
    }

    if (!databaseURL) {
      throw new Error('FIREBASE_DATABASE_URL is required');
    }

    if (admin.apps.length > 0) {
      this.dbInstance = admin.database();
      return;
    }

    const fullKeyPath = join(process.cwd(), keyPath);

    try {
      admin.initializeApp({
        credential: admin.credential.cert(fullKeyPath),
        databaseURL,
      });

      this.dbInstance = admin.database();
    } catch (error) {
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