import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  // const FIREBASE_KEY_PATH = process.env.FIREBASE_KEY_PATH;
  // const FIREBASE_DATABASE_URL = process.env.FIREBASE_DATABASE_URL;

  // const serviceAccountPath = path.resolve(process.cwd(), FIREBASE_KEY_PATH);

  // admin.initializeApp({
  //   credential: admin.credential.cert(serviceAccountPath),
  //   databaseURL: FIREBASE_DATABASE_URL,
  // });

  const app = await NestFactory.create(AppModule/*, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn']
        : ['log', 'debug', 'error', 'warn'],
  }*/);

  app.useGlobalPipes(new ValidationPipe);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}/graphql`);
}
bootstrap();