import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LookupsController } from './lookups.controller';
import { LookupsService } from './lookups.service';
import { ListEntity } from '../lists-management/entities/list.entity';
import { ListValueEntity } from '../lists-management/entities/list-value.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ListEntity, ListValueEntity]),
  ],
  controllers: [LookupsController],
  providers: [LookupsService],
  exports: [LookupsService],
})
export class LookupsModule {}
