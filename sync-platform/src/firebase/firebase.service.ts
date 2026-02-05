import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private dbInstance: admin.database.Database;

  constructor(private configService: ConfigService) {}

  async onModuleInit(): Promise<void> {

    const FIREBASE_KEY_PATH = this.configService.get<string>('FIREBASE_KEY_PATH');
    const FIREBASE_DATABASE_URL = this.configService.get<string>('FIREBASE_DATABASE_URL');

    if (admin.apps.length > 0) {
      this.dbInstance = admin.database();
      return;
    }

    const fullKeyPath = join(process.cwd(), FIREBASE_KEY_PATH);

    try {
      admin.initializeApp({
        credential: admin.credential.cert(fullKeyPath),
        databaseURL: FIREBASE_DATABASE_URL,
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