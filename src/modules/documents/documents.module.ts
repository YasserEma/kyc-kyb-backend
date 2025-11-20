import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentEntity } from './entities/document.entity';
import { DocumentRepository } from './repositories/document.repository';
import { DocumentConfigurationEntity } from '../document-configurations/entities/document-configuration.entity';
import { DocumentConfigurationRepository } from '../document-configurations/repositories/document-configuration.repository';
import { LocalStorageService } from '../common/services/local-storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DocumentEntity,
      DocumentConfigurationEntity,
    ]),
  ],
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    DocumentRepository,
    DocumentConfigurationRepository,
    LocalStorageService,
  ],
  exports: [DocumentsService, DocumentRepository],
})
export class DocumentsModule {}