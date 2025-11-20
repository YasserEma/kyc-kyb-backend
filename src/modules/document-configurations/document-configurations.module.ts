import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentConfigurationEntity } from './entities/document-configuration.entity';
import { DocumentConfigurationsController } from './document-configurations.controller';
import { DocumentConfigurationsService } from './document-configurations.service';
import { DocumentConfigurationRepository } from './repositories/document-configuration.repository';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentConfigurationEntity])],
  controllers: [DocumentConfigurationsController],
  providers: [DocumentConfigurationsService, DocumentConfigurationRepository],
  exports: [TypeOrmModule, DocumentConfigurationRepository],
})
export class DocumentConfigurationsModule {}