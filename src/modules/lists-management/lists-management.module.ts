import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListEntity } from './entities/list.entity';
import { ListValueEntity } from './entities/list-value.entity';
import { ListRepository } from './repositories/list.repository';
import { ListValueRepository } from './repositories/list-value.repository';
import { ListsManagementService } from './lists-management.service';
import { ListsManagementController } from './lists-management.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ListEntity, ListValueEntity]),
  ],
  controllers: [ListsManagementController],
  providers: [
    ListsManagementService,
    ListRepository,
    ListValueRepository,
  ],
  exports: [ListsManagementService, ListRepository, ListValueRepository],
})
export class ListsManagementModule {}
