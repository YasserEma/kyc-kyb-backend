import { Injectable } from '@nestjs/common';
import { PaginationOptions } from '../common/interfaces/pagination.interface';
import { IndividualEntityRelationshipRepository, IndividualEntityRelationshipFilter } from './repositories/individual-entity-relationship.repository';

@Injectable()
export class IndividualEntityRelationshipsService {
  constructor(private readonly repo: IndividualEntityRelationshipRepository) {}

  async listRelationships(filter: Partial<IndividualEntityRelationshipFilter> = {}, pagination: PaginationOptions = {}) {
    return this.repo.findWithFilters(filter, pagination);
  }

  async listByIndividual(individualId: string, filter: Partial<IndividualEntityRelationshipFilter> = {}, pagination: PaginationOptions = {}) {
    return this.repo.findByIndividualId(individualId, filter, pagination);
  }

  async createRelationship(payload: {
    subscriberId: string;
    userId: string;
    data: any;
  }) {
    const sql = `INSERT INTO individual_relationships (
      primary_individual_id,
      related_individual_id,
      relationship_type,
      relationship_status,
      effective_from,
      created_by
    ) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, created_at, updated_at, deleted_at, is_active`;
    const params = [
      payload.data.primary_individual_id,
      payload.data.related_individual_id,
      payload.data.relationship_type,
      payload.data.relationship_status || 'active',
      new Date() as any,
      payload.userId,
    ];
    const rows = await (this.repo as any).repository.manager.query(sql, params);
    return rows?.[0] || { id: undefined };
  }

  async verifyRelationship(id: string, userId: string, isVerified: boolean, method?: string) {
    return this.repo.updateVerificationStatus(id, isVerified, userId, method);
  }

  async reviewRelationship(id: string, userId: string, nextReviewDate?: Date) {
    return this.repo.updateReviewDate(id, userId, nextReviewDate);
  }

  async updateRisk(id: string, userId: string, riskLevel: string, riskFactors?: string) {
    return this.repo.updateRiskLevel(id, riskLevel, riskFactors, userId);
  }

  async getStatistics(filter: Partial<IndividualEntityRelationshipFilter> = {}) {
    const individualId = (filter as any)?.individual_id 
      ?? filter?.primary_individual_id 
      ?? filter?.related_individual_id;
    return this.repo.getRelationshipStatistics(individualId as string | undefined);
  }
}