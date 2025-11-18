import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationRelationshipsController } from './organization-relationships.controller';
import { OrganizationRelationshipsService } from './organization-relationships.service';
import { OrganizationRelationshipRepository } from './repositories/organization-relationship.repository';
import { EntityRepository } from '../entities/repositories/entity.repository';
import { EntityHistoryRepository } from '../entity-history/repositories/entity-history.repository';

import { OrganizationRelationshipEntity } from './entities/organization-relationship.entity';
import { EntityEntity } from '../entities/entities/entity.entity';
import { EntityHistoryEntity } from '../entity-history/entities/entity-history.entity';
import { SubscriberUserEntity } from '../subscriber-users/entities/subscriber-user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganizationRelationshipEntity,
      EntityEntity,
      EntityHistoryEntity,
      SubscriberUserEntity,
    ]),
  ],
  controllers: [OrganizationRelationshipsController],
  providers: [
    OrganizationRelationshipsService,
    OrganizationRelationshipRepository,
    EntityRepository,
    EntityHistoryRepository,
  ],
  exports: [OrganizationRelationshipsService],
})
export class OrganizationRelationshipsModule {}