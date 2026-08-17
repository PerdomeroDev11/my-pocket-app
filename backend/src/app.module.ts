import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma-config/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import resendConfig from '@/config/resend.config';
import dbConfig from '@/config/db.config';
import redisConfig from '@/config/redis.config';
import { envSchema } from '@/config/env.validator';
import { UsersModule } from '@/modules/users/users.module';
import appConfig from '@/config/app.config';
import jwtConfig from '@/config/jwt.config';
import { AuthModule } from './modules/auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { StorageModule } from './storage/storage.module';
import googleConfig from './config/google.config';
import storageConfig from './config/storage.config';
import { financialInstitutionsModule } from './modules/financial-institutions/financial-institutions.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MovementsModule } from './modules/movements/movements.module';
import { FinanacialPagesModule } from './modules/financials-pages/financial-page.module';
import { BalanceSectionModule } from './modules/balance-section/balance-section.module';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envSchema,
      load: [
        appConfig,
        resendConfig,
        dbConfig,
        redisConfig,
        jwtConfig,
        googleConfig,
        storageConfig
      ],
    }),
    UsersModule,
    PrismaModule,
    AuthModule,
    RedisModule,
    StorageModule,
    financialInstitutionsModule,
    CategoriesModule,
    MovementsModule,
    FinanacialPagesModule,
    BalanceSectionModule
  ],
  
})
export class AppModule {}
