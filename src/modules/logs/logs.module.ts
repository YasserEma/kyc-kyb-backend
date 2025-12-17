import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEntity } from './entities/log.entity';
import { LogRepository } from './repositories/log.repository';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LogEntity])],
  controllers: [LogsController],
  providers: [LogRepository, LogsService],
  exports: [LogRepository, LogsService, TypeOrmModule],
})
export class LogsModule {}