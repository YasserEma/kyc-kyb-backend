import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationEntityAssociationsController } from './organization-entity-associations.controller';
import { OrganizationEntityAssociationsService } from './organization-entity-associations.service';
import { OrganizationEntityAssociationRepository } from './repositories/organization-entity-association.repository';
import { EntityRepository } from '../entities/repositories/entity.repository';
import { OrganizationEntityRepository } from '../entities/repositories/organization-entity.repository';
import { IndividualEntityRepository } from '../entities/repositories/individual-entity.repository';
import { EntityHistoryRepository } from '../entity-history/repositories/entity-history.repository';

import { OrganizationEntityAssociationEntity } from './entities/organization-entity-association.entity';
import { EntityEntity } from '../entities/entities/entity.entity';
import { EntityHistoryEntity } from '../entity-history/entities/entity-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganizationEntityAssociationEntity,
      EntityEntity,
      EntityHistoryEntity,
    ]),
  ],
  controllers: [OrganizationEntityAssociationsController],
  providers: [
    OrganizationEntityAssociationsService,
    OrganizationEntityAssociationRepository,
    EntityRepository,
    EntityHistoryRepository,
  ],
  exports: [OrganizationEntityAssociationsService],
})
export class OrganizationEntityAssociationsModule {}