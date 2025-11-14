import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DocumentEntity } from './entities/document.entity';
import { DocumentRepository } from './repositories/document.repository';

interface CreateDocumentInput {
  entity_id?: string;
  subscriber_id: string;
  document_name: string;
  document_type: string;
  file_path: string;
  file_name: string;
  original_file_name: string;
  mime_type: string;
  file_size: number;
  issue_date?: Date;
  expiry_date?: Date;
  issuing_authority?: string;
  issuing_country?: string;
  document_number?: string;
}

@Injectable()
export class DocumentsService {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async createDocument(uploaderId: string, input: CreateDocumentInput) {
    const doc = this.documentRepository.create({
      entity_id: input.entity_id,
      subscriber_id: input.subscriber_id,
      document_name: input.document_name,
      document_type: input.document_type,
      file_path: input.file_path,
      file_name: input.file_name,
      original_file_name: input.original_file_name,
      file_extension: input.file_name.split('.').pop() || '',
      mime_type: input.mime_type,
      file_size: input.file_size,
      issue_date: input.issue_date,
      expiry_date: input.expiry_date,
      issuing_authority: input.issuing_authority,
      issuing_country: input.issuing_country,
      document_number: input.document_number,
      uploaded_by: uploaderId,
      is_active: true,
      document_status: 'uploaded',
      verification_status: 'pending',
    } as any);

    return this.documentRepository.save(doc);
  }

  // Phase 3 stub: create a document record from a file payload within a transaction
  async createDocumentFromFile(
    filePayload: string,
    subscriberId: string,
    userId: string,
    manager: any,
    options?: {
      entity_id?: string;
      document_type?: string;
      issue_date?: Date;
      expiry_date?: Date;
      issuing_authority?: string;
      issuing_country?: string;
      document_number?: string;
      document_name?: string;
      mime_type?: string;
    }
  ) {
    // This is a stub: we don't store the actual file. We record minimal metadata.
    const fileName = `${randomUUID()}.bin`;
    const doc = this.documentRepository.create({
      entity_id: options?.entity_id,
      subscriber_id: subscriberId,
      document_name: options?.document_name ?? 'Identity Document',
      document_type: options?.document_type ?? 'identity',
      file_path: '/tmp/stub',
      file_name: fileName,
      original_file_name: 'uploaded.bin',
      file_extension: 'bin',
      mime_type: options?.mime_type ?? 'application/octet-stream',
      file_size: 0,
      issue_date: options?.issue_date,
      expiry_date: options?.expiry_date,
      issuing_authority: options?.issuing_authority,
      issuing_country: options?.issuing_country,
      document_number: options?.document_number,
      uploaded_by: userId,
      is_active: true,
      document_status: 'uploaded',
      verification_status: 'pending',
    } as any);

    const repo = manager.getRepository((this.documentRepository as any).repository.target) as any;
    const saved: DocumentEntity = await repo.save(doc);
    return saved;
  }
}