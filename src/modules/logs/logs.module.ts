import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogEntity } from './entities/log.entity';
import { LogRepository } from './repositories/log.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LogEntity])],
  providers: [LogRepository],
  exports: [LogRepository, TypeOrmModule],
})
export class LogsModule {}