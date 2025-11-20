import { Injectable, BadRequestException } from '@nestjs/common';
import { DocumentConfigurationRepository } from './repositories/document-configuration.repository';
import { CreateDocumentConfigurationDto } from './dtos/create-document-configuration.dto';
import { UpdateDocumentConfigurationDto } from './dtos/update-document-configuration.dto';

@Injectable()
export class DocumentConfigurationsService {
  constructor(private readonly repo: DocumentConfigurationRepository) {}

  async create(dto: CreateDocumentConfigurationDto) {
    const existing = await this.repo.findOne({ where: { code: dto.code } });
    if (existing) throw new BadRequestException('Code already exists');
    const entity = this.repo.create({
      name: dto.name,
      code: dto.code,
      allowed_extensions: dto.allowed_extensions,
      max_size_bytes: dto.max_size_bytes,
      is_expiry_required: dto.is_expiry_required,
      is_active: dto.is_active,
    } as any);
    return this.repo.save(entity);
  }

  async list() {
    return this.repo.findActive();
  }
}