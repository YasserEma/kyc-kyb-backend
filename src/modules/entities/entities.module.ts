import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EntitiesController } from './entities.controller';
import { EntitiesService } from './services/entities.service';

// Entities module entities
import { EntityEntity } from './entities/entity.entity';
import { IndividualEntity } from './entities/individual-entity.entity';
import { OrganizationEntity } from './entities/organization-entity.entity';

// Cross-module entities
import { EntityHistoryEntity } from '../entity-history/entities/entity-history.entity';
import { EntityCustomFieldEntity } from '../entity-custom-fields/entities/entity-custom-field.entity';
import { ScreeningAnalysisEntity } from '../screening-analysis/entities/screening-analysis.entity';
import { RiskAnalysisEntity } from '../risk-analysis/entities/risk-analysis.entity';
import { DocumentEntity } from '../documents/entities/document.entity';

// Repositories
import { EntityRepository } from './repositories/entity.repository';
import { IndividualEntityRepository } from './repositories/individual-entity.repository';
import { OrganizationEntityRepository } from './repositories/organization-entity.repository';
import { EntityHistoryRepository } from '../entity-history/repositories/entity-history.repository';
import { EntityCustomFieldRepository } from '../entity-custom-fields/repositories/entity-custom-field.repository';
import { ScreeningAnalysisRepository } from '../screening-analysis/repositories/screening-analysis.repository';
import { RiskAnalysisRepository } from '../risk-analysis/repositories/risk-analysis.repository';
import { DocumentRepository } from '../documents/repositories/document.repository';
import { IndividualIdentityDocumentsModule } from '../individual-identity-documents/individual-identity-documents.module';
import { IndividualRelationshipsModule } from '../individual-entity-relationships/individual-entity-relationships.module';
import { OrganizationEntityAssociationEntity } from '../organization-entity-associations/entities/organization-entity-association.entity';
import { OrganizationEntityAssociationRepository } from '../organization-entity-associations/repositories/organization-entity-association.repository';
import { DocumentsService } from '../documents/documents.service';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EntityEntity,
      IndividualEntity,
      OrganizationEntity,
      EntityHistoryEntity,
      EntityCustomFieldEntity,
      ScreeningAnalysisEntity,
      RiskAnalysisEntity,
      DocumentEntity,
      OrganizationEntityAssociationEntity,
    ]),
    IndividualIdentityDocumentsModule,
    IndividualRelationshipsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [EntitiesController],
  providers: [
    EntitiesService,
    EntityRepository,
    IndividualEntityRepository,
    OrganizationEntityRepository,
    EntityHistoryRepository,
    EntityCustomFieldRepository,
    ScreeningAnalysisRepository,
    RiskAnalysisRepository,
    DocumentRepository,
    OrganizationEntityAssociationRepository,
    DocumentsService,
  ],
  exports: [EntityRepository, IndividualEntityRepository, OrganizationEntityRepository, TypeOrmModule],
})
export class EntitiesModule {}