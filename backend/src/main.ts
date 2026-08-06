import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './prisma-config/prisma.filter';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
