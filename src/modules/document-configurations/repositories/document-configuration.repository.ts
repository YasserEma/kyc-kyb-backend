import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { DocumentConfigurationEntity } from '../entities/document-configuration.entity';

@Injectable()
export class DocumentConfigurationRepository extends BaseRepository<DocumentConfigurationEntity> {
  constructor(
    @InjectRepository(DocumentConfigurationEntity)
    repository: Repository<DocumentConfigurationEntity>,
  ) {
    super(repository);
  }

  async findActive(): Promise<DocumentConfigurationEntity[]> {
    return this.repository.find({ where: { is_active: true } });
  }
}