import 'dotenv/config';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { getDatabaseConfig } from './config/database.config';
import appConfig from './config/app.config';
import { validateEnv } from './config/validation.schema';
import { AuthModule } from './modules/auth/auth.module';

const shouldInitDb = process.env.SKIP_DB !== 'true';
const typeOrmImports = shouldInitDb
  ? [
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          validateEnv();
          return getDatabaseConfig(configService);
        },
      }),
    ]
  : [];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: 1000, // 1 second
          limit: 3,
        },
        {
          name: 'medium',
          ttl: 10000, // 10 seconds
          limit: 20,
        },
        {
          name: 'long',
          ttl: 60000, // 1 minute
          limit: 100,
        },
      ],
    }),
    ...typeOrmImports,
    AuthModule,
  ],
})
export class AppModule {}