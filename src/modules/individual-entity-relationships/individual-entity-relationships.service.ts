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
    const entity = this.repo.create({
      ...payload.data,
      // subscriber_id is not a column on relationships; rely on individual ownership
      created_by: payload.userId,
    } as any);
    return this.repo.save(entity);
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