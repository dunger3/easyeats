import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors();

  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  const clientDist = join(__dirname, '..', 'client', 'dist');
  if (existsSync(clientDist)) app.useStaticAssets(clientDist);

  // SPA fallback for anything that isn't /api/*
  app.getHttpAdapter().getInstance().get(/^(?!\/api).*$/, (_req: any, res: any) => {
    const index = join(clientDist, 'index.html');
    if (existsSync(index)) res.sendFile(index);
    else res.status(200).json({ message: 'API running. Run the Vite dev server for the UI.' });
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`API → http://localhost:${port}/api`);
}
bootstrap();
