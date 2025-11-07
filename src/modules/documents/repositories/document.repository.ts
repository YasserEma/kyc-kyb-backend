import { Repository, SelectQueryBuilder } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentEntity } from '../entities/document.entity';
import { BaseFilter, PaginationOptions, PaginationResult } from '../../common/interfaces';
import { BaseRepository } from '../../common/repositories/base.repository';
import { QueryHelper } from '../../../utils/database/query.helper';

export interface DocumentFilter extends BaseFilter {
  entity_id?: string;
  subscriber_id?: string;
  document_type?: string | string[];
  document_subtype?: string;
  document_status?: string | string[];
  verification_status?: string | string[];
  is_sensitive?: boolean;
  is_encrypted?: boolean;
  is_required?: boolean;
  is_active?: boolean;
  is_expired?: boolean;
  is_expiring_soon?: boolean;
  issuing_country?: string;
  issuing_authority?: string;
  uploaded_by?: string;
  verified_by?: string;
  file_extension?: string | string[];
  mime_type?: string | string[];
  min_file_size?: number;
  max_file_size?: number;
  min_confidence_score?: number;
  max_confidence_score?: number;
  issue_date_from?: Date;
  issue_date_to?: Date;
  expiry_date_from?: Date;
  expiry_date_to?: Date;
  verification_date_from?: Date;
  verification_date_to?: Date;
  retention_until_from?: Date;
  retention_until_to?: Date;
  tags?: string | string[];
  has_extracted_data?: boolean;
  has_ocr_data?: boolean;
  has_validation_results?: boolean;
  storage_provider?: string;
  retention_policy?: string;
}

@Injectable()
export class DocumentRepository extends BaseRepository<DocumentEntity> {
  constructor(
    @InjectRepository(DocumentEntity)
    repository: Repository<DocumentEntity>,
  ) {
    super(repository);
  }

  async findWithFilters(
    filters: DocumentFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<DocumentEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findByEntityId(
    entityId: string,
    filters: Omit<DocumentFilter, 'entity_id'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<DocumentEntity>> {
    return this.findWithFilters({ ...filters, entity_id: entityId }, pagination);
  }

  async findBySubscriberId(
    subscriberId: string,
    filters: Omit<DocumentFilter, 'subscriber_id'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<DocumentEntity>> {
    return this.findWithFilters({ ...filters, subscriber_id: subscriberId }, pagination);
  }

  async findByDocumentType(
    documentType: string | string[],
    filters: Omit<DocumentFilter, 'document_type'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<DocumentEntity>> {
    return this.findWithFilters({ ...filters, document_type: documentType }, pagination);
  }

  async findByVerificationStatus(
    verificationStatus: string | string[],
    filters: Omit<DocumentFilter, 'verification_status'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<DocumentEntity>> {
    return this.findWithFilters({ ...filters, verification_status: verificationStatus }, pagination);
  }

  async findExpiredDocuments(
    filters: DocumentFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<DocumentEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('documents.expiry_date < :currentDate', { currentDate: new Date() });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findExpiringDocuments(
    daysAhead: number = 30,
    filters: DocumentFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<DocumentEntity>> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysAhead);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('documents.expiry_date BETWEEN :currentDate AND :expiryDate', {
      currentDate: new Date(),
      expiryDate,
    });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findSensitiveDocuments(
    filters: Omit<DocumentFilter, 'is_sensitive'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<DocumentEntity>> {
    return this.findWithFilters({ ...filters, is_sensitive: true }, pagination);
  }

  async findUnencryptedSensitiveDocuments(
    filters: DocumentFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<DocumentEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('documents.is_sensitive = :isSensitive', { isSensitive: true });
    queryBuilder.andWhere('documents.is_encrypted = :isEncrypted', { isEncrypted: false });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findRequiredDocuments(
    filters: Omit<DocumentFilter, 'is_required'> = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<DocumentEntity>> {
    return this.findWithFilters({ ...filters, is_required: true }, pagination);
  }

  async findPendingVerificationDocuments(
    filters: DocumentFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<DocumentEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('documents.verification_status IN (:...statuses)', {
      statuses: ['pending', 'in_progress'],
    });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findLowConfidenceDocuments(
    threshold: number = 0.8,
    filters: DocumentFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<DocumentEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('documents.confidence_score < :threshold', { threshold });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findDocumentsByTags(
    tags: string[],
    matchAll: boolean = false,
    filters: DocumentFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<DocumentEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    
    if (matchAll) {
      tags.forEach((tag, index) => {
        queryBuilder.andWhere(`documents.tags ILIKE :tag${index}`, { [`tag${index}`]: `%${tag}%` });
      });
    } else {
      const tagConditions = tags.map((_, index) => `documents.tags ILIKE :tag${index}`).join(' OR ');
      const tagParams = tags.reduce((params, tag, index) => {
        params[`tag${index}`] = `%${tag}%`;
        return params;
      }, {} as Record<string, string>);
      
      queryBuilder.andWhere(`(${tagConditions})`, tagParams);
    }
    
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findRetentionExpiredDocuments(
    filters: DocumentFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<DocumentEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('documents.retention_until < :currentDate', { currentDate: new Date() });
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findDuplicateDocuments(
    filters: DocumentFilter = {},
    pagination: PaginationOptions = {},
  ): Promise<PaginationResult<DocumentEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('documents.file_hash IN (SELECT file_hash FROM documents GROUP BY file_hash HAVING COUNT(*) > 1)');
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async updateDocumentStatus(
    id: string,
    status: string,
    updatedBy?: string,
  ): Promise<void> {
    const updateData: any = { document_status: status, updated_at: new Date() };
    if (updatedBy) updateData.updated_by = updatedBy;
    
    await this.repository.update(id, updateData);
  }

  async updateVerificationStatus(
    id: string,
    status: string,
    verifiedBy?: string,
    notes?: string,
  ): Promise<void> {
    const updateData: any = {
      verification_status: status,
      verification_date: new Date(),
      updated_at: new Date(),
    };
    
    if (verifiedBy) updateData.verified_by = verifiedBy;
    if (notes) updateData.verification_notes = notes;
    
    await this.repository.update(id, updateData);
  }

  async rejectDocument(
    id: string,
    reason: string,
    rejectedBy?: string,
  ): Promise<void> {
    const updateData: any = {
      verification_status: 'rejected',
      document_status: 'rejected',
      rejection_reason: reason,
      rejection_date: new Date(),
      updated_at: new Date(),
    };
    
    if (rejectedBy) updateData.rejected_by = rejectedBy;
    
    await this.repository.update(id, updateData);
  }

  async updateExtractedData(
    id: string,
    extractedData: Record<string, any>,
    confidenceScore?: number,
  ): Promise<void> {
    const updateData: any = {
      extracted_data: extractedData,
      updated_at: new Date(),
    };
    
    if (confidenceScore !== undefined) updateData.confidence_score = confidenceScore;
    
    await this.repository.update(id, updateData);
  }

  async updateOcrData(
    id: string,
    ocrData: Record<string, any>,
  ): Promise<void> {
    await this.repository.update(id, {
      ocr_data: ocrData,
      updated_at: new Date(),
    });
  }

  async updateValidationResults(
    id: string,
    validationResults: Record<string, any>,
  ): Promise<void> {
    await this.repository.update(id, {
      validation_results: validationResults,
      updated_at: new Date(),
    });
  }

  async incrementDownloadCount(id: string, accessedBy?: string): Promise<void> {
    const updateData: any = {
      download_count: () => 'download_count + 1',
      last_accessed_at: new Date(),
      updated_at: new Date(),
    };
    
    if (accessedBy) updateData.last_accessed_by = accessedBy;
    
    await this.repository.update(id, updateData);
  }

  async updateRetentionPolicy(
    id: string,
    retentionPolicy: string,
    retentionUntil: Date,
  ): Promise<void> {
    await this.repository.update(id, {
      retention_policy: retentionPolicy,
      retention_until: retentionUntil,
      updated_at: new Date(),
    });
  }

  async getDocumentStatistics(filters: DocumentFilter = {}): Promise<{
    total: number;
    by_type: Record<string, number>;
    by_status: Record<string, number>;
    by_verification_status: Record<string, number>;
    sensitive_count: number;
    encrypted_count: number;
    expired_count: number;
    expiring_soon_count: number;
    pending_verification_count: number;
    low_confidence_count: number;
    total_file_size: number;
    average_confidence_score: number;
  }> {
    const queryBuilder = this.createFilteredQuery(filters);
    
    const [
      total,
      byType,
      byStatus,
      byVerificationStatus,
      sensitiveCount,
      encryptedCount,
      expiredCount,
      expiringSoonCount,
      pendingVerificationCount,
      lowConfidenceCount,
      fileSizeSum,
      avgConfidence,
    ] = await Promise.all([
      queryBuilder.getCount(),
      this.getCountByField('document_type', filters),
      this.getCountByField('document_status', filters),
      this.getCountByField('verification_status', filters),
      this.getCountWithCondition({ ...filters, is_sensitive: true }),
      this.getCountWithCondition({ ...filters, is_encrypted: true }),
      this.getExpiredCount(filters),
      this.getExpiringSoonCount(30, filters),
      this.getCountWithCondition({ ...filters, verification_status: ['pending', 'in_progress'] }),
      this.getLowConfidenceCount(0.8, filters),
      this.getTotalFileSize(filters),
      this.getAverageConfidenceScore(filters),
    ]);

    return {
      total,
      by_type: byType,
      by_status: byStatus,
      by_verification_status: byVerificationStatus,
      sensitive_count: sensitiveCount,
      encrypted_count: encryptedCount,
      expired_count: expiredCount,
      expiring_soon_count: expiringSoonCount,
      pending_verification_count: pendingVerificationCount,
      low_confidence_count: lowConfidenceCount,
      total_file_size: fileSizeSum,
      average_confidence_score: avgConfidence,
    };
  }

  private createFilteredQuery(filters: DocumentFilter): SelectQueryBuilder<DocumentEntity> {
    const queryBuilder = this.repository.createQueryBuilder('documents');

    // Apply base filters
    QueryHelper.applyBaseFilters(queryBuilder, filters, 'documents');

    // Apply specific filters
    if (filters.entity_id) {
      queryBuilder.andWhere('documents.entity_id = :entityId', { entityId: filters.entity_id });
    }

    if (filters.subscriber_id) {
      queryBuilder.andWhere('documents.subscriber_id = :subscriberId', { subscriberId: filters.subscriber_id });
    }

    if (filters.document_type) {
      QueryHelper.applyInFilter(queryBuilder, 'documents.document_type', filters.document_type);
    }

    if (filters.document_subtype) {
      queryBuilder.andWhere('documents.document_subtype = :documentSubtype', { documentSubtype: filters.document_subtype });
    }

    if (filters.document_status) {
      QueryHelper.applyInFilter(queryBuilder, 'documents.document_status', filters.document_status);
    }

    if (filters.verification_status) {
      QueryHelper.applyInFilter(queryBuilder, 'documents.verification_status', filters.verification_status);
    }

    if (filters.is_sensitive !== undefined) {
      queryBuilder.andWhere('documents.is_sensitive = :isSensitive', { isSensitive: filters.is_sensitive });
    }

    if (filters.is_encrypted !== undefined) {
      queryBuilder.andWhere('documents.is_encrypted = :isEncrypted', { isEncrypted: filters.is_encrypted });
    }

    if (filters.is_required !== undefined) {
      queryBuilder.andWhere('documents.is_required = :isRequired', { isRequired: filters.is_required });
    }

    if (filters.is_active !== undefined) {
      queryBuilder.andWhere('documents.is_active = :isActive', { isActive: filters.is_active });
    }

    if (filters.is_expired !== undefined) {
      if (filters.is_expired) {
        queryBuilder.andWhere('documents.expiry_date < :currentDate', { currentDate: new Date() });
      } else {
        queryBuilder.andWhere('(documents.expiry_date IS NULL OR documents.expiry_date >= :currentDate)', { currentDate: new Date() });
      }
    }

    if (filters.is_expiring_soon !== undefined) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      if (filters.is_expiring_soon) {
        queryBuilder.andWhere('documents.expiry_date BETWEEN :currentDate AND :expiryDate', {
          currentDate: new Date(),
          expiryDate: thirtyDaysFromNow,
        });
      } else {
        queryBuilder.andWhere('(documents.expiry_date IS NULL OR documents.expiry_date > :expiryDate)', { expiryDate: thirtyDaysFromNow });
      }
    }

    if (filters.issuing_country) {
      queryBuilder.andWhere('documents.issuing_country = :issuingCountry', { issuingCountry: filters.issuing_country });
    }

    if (filters.issuing_authority) {
      queryBuilder.andWhere('documents.issuing_authority ILIKE :issuingAuthority', { issuingAuthority: `%${filters.issuing_authority}%` });
    }

    if (filters.uploaded_by) {
      queryBuilder.andWhere('documents.uploaded_by = :uploadedBy', { uploadedBy: filters.uploaded_by });
    }

    if (filters.verified_by) {
      queryBuilder.andWhere('documents.verified_by = :verifiedBy', { verifiedBy: filters.verified_by });
    }

    if (filters.file_extension) {
      QueryHelper.applyInFilter(queryBuilder, 'documents.file_extension', filters.file_extension);
    }

    if (filters.mime_type) {
      QueryHelper.applyInFilter(queryBuilder, 'documents.mime_type', filters.mime_type);
    }

    if (filters.min_file_size !== undefined) {
      queryBuilder.andWhere('documents.file_size >= :minFileSize', { minFileSize: filters.min_file_size });
    }

    if (filters.max_file_size !== undefined) {
      queryBuilder.andWhere('documents.file_size <= :maxFileSize', { maxFileSize: filters.max_file_size });
    }

    if (filters.min_confidence_score !== undefined) {
      queryBuilder.andWhere('documents.confidence_score >= :minConfidenceScore', { minConfidenceScore: filters.min_confidence_score });
    }

    if (filters.max_confidence_score !== undefined) {
      queryBuilder.andWhere('documents.confidence_score <= :maxConfidenceScore', { maxConfidenceScore: filters.max_confidence_score });
    }

    // Date range filters
    if (filters.issue_date_from) {
      queryBuilder.andWhere('documents.issue_date >= :issueDateFrom', { issueDateFrom: filters.issue_date_from });
    }

    if (filters.issue_date_to) {
      queryBuilder.andWhere('documents.issue_date <= :issueDateTo', { issueDateTo: filters.issue_date_to });
    }

    if (filters.expiry_date_from) {
      queryBuilder.andWhere('documents.expiry_date >= :expiryDateFrom', { expiryDateFrom: filters.expiry_date_from });
    }

    if (filters.expiry_date_to) {
      queryBuilder.andWhere('documents.expiry_date <= :expiryDateTo', { expiryDateTo: filters.expiry_date_to });
    }

    if (filters.verification_date_from) {
      queryBuilder.andWhere('documents.verification_date >= :verificationDateFrom', { verificationDateFrom: filters.verification_date_from });
    }

    if (filters.verification_date_to) {
      queryBuilder.andWhere('documents.verification_date <= :verificationDateTo', { verificationDateTo: filters.verification_date_to });
    }

    if (filters.retention_until_from) {
      queryBuilder.andWhere('documents.retention_until >= :retentionUntilFrom', { retentionUntilFrom: filters.retention_until_from });
    }

    if (filters.retention_until_to) {
      queryBuilder.andWhere('documents.retention_until <= :retentionUntilTo', { retentionUntilTo: filters.retention_until_to });
    }

    if (filters.tags) {
      const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
      const tagConditions = tags.map((_, index) => `documents.tags ILIKE :tag${index}`).join(' OR ');
      const tagParams = tags.reduce((params, tag, index) => {
        params[`tag${index}`] = `%${tag}%`;
        return params;
      }, {} as Record<string, string>);
      
      queryBuilder.andWhere(`(${tagConditions})`, tagParams);
    }

    if (filters.has_extracted_data !== undefined) {
      if (filters.has_extracted_data) {
        queryBuilder.andWhere('documents.extracted_data IS NOT NULL');
      } else {
        queryBuilder.andWhere('documents.extracted_data IS NULL');
      }
    }

    if (filters.has_ocr_data !== undefined) {
      if (filters.has_ocr_data) {
        queryBuilder.andWhere('documents.ocr_data IS NOT NULL');
      } else {
        queryBuilder.andWhere('documents.ocr_data IS NULL');
      }
    }

    if (filters.has_validation_results !== undefined) {
      if (filters.has_validation_results) {
        queryBuilder.andWhere('documents.validation_results IS NOT NULL');
      } else {
        queryBuilder.andWhere('documents.validation_results IS NULL');
      }
    }

    if (filters.storage_provider) {
      queryBuilder.andWhere('documents.storage_provider = :storageProvider', { storageProvider: filters.storage_provider });
    }

    if (filters.retention_policy) {
      queryBuilder.andWhere('documents.retention_policy = :retentionPolicy', { retentionPolicy: filters.retention_policy });
    }

    return queryBuilder;
  }

  private async getCountByField(field: string, filters: DocumentFilter): Promise<Record<string, number>> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select(`documents.${field}`, 'field_value');
    queryBuilder.addSelect('COUNT(*)', 'count');
    queryBuilder.groupBy(`documents.${field}`);

    const results = await queryBuilder.getRawMany();
    return results.reduce((acc, result) => {
      acc[result.field_value] = parseInt(result.count);
      return acc;
    }, {});
  }

  private async getCountWithCondition(filters: DocumentFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    return queryBuilder.getCount();
  }

  private async getExpiredCount(filters: DocumentFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('documents.expiry_date < :currentDate', { currentDate: new Date() });
    return queryBuilder.getCount();
  }

  private async getExpiringSoonCount(daysAhead: number, filters: DocumentFilter): Promise<number> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysAhead);

    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('documents.expiry_date BETWEEN :currentDate AND :expiryDate', {
      currentDate: new Date(),
      expiryDate,
    });
    return queryBuilder.getCount();
  }

  private async getLowConfidenceCount(threshold: number, filters: DocumentFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.andWhere('documents.confidence_score < :threshold', { threshold });
    return queryBuilder.getCount();
  }

  private async getTotalFileSize(filters: DocumentFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('SUM(documents.file_size)', 'total_size');
    
    const result = await queryBuilder.getRawOne();
    return parseInt(result.total_size) || 0;
  }

  private async getAverageConfidenceScore(filters: DocumentFilter): Promise<number> {
    const queryBuilder = this.createFilteredQuery(filters);
    queryBuilder.select('AVG(documents.confidence_score)', 'avg_confidence');
    queryBuilder.andWhere('documents.confidence_score IS NOT NULL');
    
    const result = await queryBuilder.getRawOne();
    return parseFloat(result.avg_confidence) || 0;
  }
}