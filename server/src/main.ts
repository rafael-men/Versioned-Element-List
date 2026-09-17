import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { helmetMiddleware } from './infrastructure/middlewares/helmet-csp.config';
import { setupSwagger } from './infrastructure/config/swagger-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmetMiddleware());
  setupSwagger(app);
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = parseInt(process.env.PORT ?? '4000', 10);
  await app.listen(port);
}
bootstrap();
