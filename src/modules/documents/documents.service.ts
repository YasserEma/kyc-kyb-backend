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
    const fileName = `${randomUUID()}.bin`;
    const result = await manager.query(
      `INSERT INTO documents (
         is_active,
         entity_id,
         subscriber_id,
         document_name,
         document_type,
         file_path,
         file_name,
         original_file_name,
         file_extension,
         mime_type,
         file_size,
         document_status,
         verification_status,
         expiry_date,
         issuing_authority,
         issuing_country,
         document_number,
         uploaded_by
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING id, created_at, updated_at, deleted_at, is_active, document_status, verification_status`,
      [
        true,
        options?.entity_id ?? null,
        subscriberId,
        options?.document_name ?? 'Identity Document',
        options?.document_type ?? 'identity',
        '/tmp/stub',
        fileName,
        'uploaded.bin',
        'bin',
        options?.mime_type ?? 'application/octet-stream',
        0,
        'uploaded',
        'pending',
        options?.expiry_date ?? null,
        options?.issuing_authority ?? null,
        options?.issuing_country ?? null,
        options?.document_number ?? null,
        userId,
      ]
    );
    const row = result?.[0] || {};
    return Object.assign(new DocumentEntity(), row, {
      entity_id: options?.entity_id ?? null,
      subscriber_id: subscriberId,
      document_name: options?.document_name ?? 'Identity Document',
      document_type: options?.document_type ?? 'identity',
      mime_type: options?.mime_type ?? 'application/octet-stream',
    });
  }
}