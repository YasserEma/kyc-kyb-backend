import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EntitiesController } from './entities.controller';
import { DocumentsController } from '../documents/documents.controller';
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
import { DocumentConfigurationEntity } from '../document-configurations/entities/document-configuration.entity';

// Repositories
import { EntityRepository } from './repositories/entity.repository';
import { IndividualEntityRepository } from './repositories/individual-entity.repository';
import { OrganizationEntityRepository } from './repositories/organization-entity.repository';
import { EntityHistoryRepository } from '../entity-history/repositories/entity-history.repository';
import { EntityCustomFieldRepository } from '../entity-custom-fields/repositories/entity-custom-field.repository';
import { ScreeningAnalysisRepository } from '../screening-analysis/repositories/screening-analysis.repository';
import { RiskAnalysisRepository } from '../risk-analysis/repositories/risk-analysis.repository';
import { DocumentRepository } from '../documents/repositories/document.repository';
import { DocumentConfigurationRepository } from '../document-configurations/repositories/document-configuration.repository';
import { IndividualIdentityDocumentsModule } from '../individual-identity-documents/individual-identity-documents.module';
import { DocumentsService } from '../documents/documents.service';
import { LocalStorageService } from '../common/services/local-storage.service';

import { AuthModule } from '../auth/auth.module';

import { EntityRelationship } from '../entity-relationships/entities/entity-relationship.entity';
import { EntityRelationshipRepository } from '../entity-relationships/repositories/entity-relationship.repository';

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
      DocumentConfigurationEntity,
      EntityRelationship,
    ]),
    IndividualIdentityDocumentsModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [EntitiesController, DocumentsController],
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
    DocumentConfigurationRepository,
    EntityRelationshipRepository,
    DocumentsService,
    LocalStorageService,
  ],
  exports: [EntityRepository, IndividualEntityRepository, OrganizationEntityRepository, EntitiesService, TypeOrmModule],
})
export class EntitiesModule { }