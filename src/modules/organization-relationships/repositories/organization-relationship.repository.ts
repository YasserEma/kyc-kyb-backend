import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OrganizationRelationshipEntity } from '../entities/organization-relationship.entity';

@Injectable()
export class OrganizationRelationshipRepository extends Repository<OrganizationRelationshipEntity> {
  constructor(private dataSource: DataSource) {
    super(OrganizationRelationshipEntity, dataSource.createEntityManager());
  }

  async findByPrimaryOrganizationId(primaryOrganizationId: string): Promise<OrganizationRelationshipEntity[]> {
    return this.createQueryBuilder('or')
      .leftJoinAndSelect('or.primary_organization', 'primary_org')
      .leftJoinAndSelect('or.related_organization', 'related_org')
      .leftJoinAndSelect('or.createdBy', 'created_by')
      .leftJoinAndSelect('or.verifiedBy', 'verified_by')
      .where('or.primary_organization_id = :primaryOrganizationId', { primaryOrganizationId })
      .andWhere('or.deleted_at IS NULL')
      .orderBy('or.created_at', 'DESC')
      .getMany();
  }

  async findByRelatedOrganizationId(relatedOrganizationId: string): Promise<OrganizationRelationshipEntity[]> {
    return this.createQueryBuilder('or')
      .leftJoinAndSelect('or.primary_organization', 'primary_org')
      .leftJoinAndSelect('or.related_organization', 'related_org')
      .leftJoinAndSelect('or.createdBy', 'created_by')
      .leftJoinAndSelect('or.verifiedBy', 'verified_by')
      .where('or.related_organization_id = :relatedOrganizationId', { relatedOrganizationId })
      .andWhere('or.deleted_at IS NULL')
      .orderBy('or.created_at', 'DESC')
      .getMany();
  }

  async findByOrganizationId(organizationId: string): Promise<OrganizationRelationshipEntity[]> {
    return this.createQueryBuilder('or')
      .leftJoinAndSelect('or.primary_organization', 'primary_org')
      .leftJoinAndSelect('or.related_organization', 'related_org')
      .leftJoinAndSelect('or.createdBy', 'created_by')
      .leftJoinAndSelect('or.verifiedBy', 'verified_by')
      .where('or.primary_organization_id = :organizationId', { organizationId })
      .orWhere('or.related_organization_id = :organizationId', { organizationId })
      .andWhere('or.deleted_at IS NULL')
      .orderBy('or.created_at', 'DESC')
      .getMany();
  }

  async findByRelationshipType(relationshipType: string): Promise<OrganizationRelationshipEntity[]> {
    return this.createQueryBuilder('or')
      .leftJoinAndSelect('or.primary_organization', 'primary_org')
      .leftJoinAndSelect('or.related_organization', 'related_org')
      .leftJoinAndSelect('or.createdBy', 'created_by')
      .leftJoinAndSelect('or.verifiedBy', 'verified_by')
      .where('or.relationship_type = :relationshipType', { relationshipType })
      .andWhere('or.deleted_at IS NULL')
      .orderBy('or.created_at', 'DESC')
      .getMany();
  }

  async findActiveRelationships(): Promise<OrganizationRelationshipEntity[]> {
    const now = new Date();
    return this.createQueryBuilder('or')
      .leftJoinAndSelect('or.primary_organization', 'primary_org')
      .leftJoinAndSelect('or.related_organization', 'related_org')
      .leftJoinAndSelect('or.createdBy', 'created_by')
      .leftJoinAndSelect('or.verifiedBy', 'verified_by')
      .where('or.effective_from <= :now', { now })
      .andWhere('(or.effective_to IS NULL OR or.effective_to >= :now)', { now })
      .andWhere('or.deleted_at IS NULL')
      .orderBy('or.created_at', 'DESC')
      .getMany();
  }

  async findVerifiedRelationships(): Promise<OrganizationRelationshipEntity[]> {
    return this.createQueryBuilder('or')
      .leftJoinAndSelect('or.primary_organization', 'primary_org')
      .leftJoinAndSelect('or.related_organization', 'related_org')
      .leftJoinAndSelect('or.createdBy', 'created_by')
      .leftJoinAndSelect('or.verifiedBy', 'verified_by')
      .where('or.verified = :verified', { verified: true })
      .andWhere('or.deleted_at IS NULL')
      .orderBy('or.created_at', 'DESC')
      .getMany();
  }

  async countByOrganizationId(organizationId: string): Promise<number> {
    return this.createQueryBuilder('or')
      .where('or.primary_organization_id = :organizationId', { organizationId })
      .orWhere('or.related_organization_id = :organizationId', { organizationId })
      .andWhere('or.deleted_at IS NULL')
      .getCount();
  }

  async countByRelationshipType(relationshipType: string): Promise<number> {
    return this.createQueryBuilder('or')
      .where('or.relationship_type = :relationshipType', { relationshipType })
      .andWhere('or.deleted_at IS NULL')
      .getCount();
  }

  async updateVerificationStatus(
    id: string,
    verified: boolean,
    verifiedBy?: string,
    verifiedAt?: Date
  ): Promise<void> {
    await this.update(id, {
      verified,
      verified_by: verifiedBy,
      verified_at: verifiedAt,
    });
  }
}