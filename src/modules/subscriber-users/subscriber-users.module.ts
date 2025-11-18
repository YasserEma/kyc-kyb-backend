import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriberUserEntity } from './entities/subscriber-user.entity';
import { SubscriberUserRepository } from './repositories/subscriber-user.repository';
import { SubscriberUsersController } from './subscriber-users.controller';
import { SubscriberUsersService } from './subscriber-users.service';
import { LogsModule } from '../logs/logs.module';
import { AuthModule } from '../auth/auth.module';
import { ScreeningAnalysisEntity } from '../screening-analysis/entities/screening-analysis.entity';
import { ScreeningAnalysisRepository } from '../screening-analysis/repositories/screening-analysis.repository';
import { RiskAnalysisEntity } from '../risk-analysis/entities/risk-analysis.entity';
import { RiskAnalysisRepository } from '../risk-analysis/repositories/risk-analysis.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([SubscriberUserEntity, ScreeningAnalysisEntity, RiskAnalysisEntity]),
    LogsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [SubscriberUsersController],
  providers: [SubscriberUserRepository, SubscriberUsersService, ScreeningAnalysisRepository, RiskAnalysisRepository],
  exports: [SubscriberUserRepository, TypeOrmModule],
})
export class SubscriberUsersModule {}