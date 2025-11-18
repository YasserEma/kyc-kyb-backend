import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull } from 'typeorm';

import { OrganizationRelationshipRepository } from './repositories/organization-relationship.repository';
import { EntityRepository } from '../entities/repositories/entity.repository';
import { EntityHistoryRepository } from '../entity-history/repositories/entity-history.repository';

import { OrganizationRelationshipEntity } from './entities/organization-relationship.entity';
import { CreateOrganizationRelationshipDto } from './dtos/create-organization-relationship.dto';
import { OrganizationEntity } from '../entities/entities/organization-entity.entity';
import { EntityHistoryEntity } from '../entity-history/entities/entity-history.entity';

@Injectable()
export class OrganizationRelationshipsService {
  constructor(
    private readonly organizationRelationshipRepository: OrganizationRelationshipRepository,
    private readonly entityRepository: EntityRepository,
    private readonly entityHistoryRepository: EntityHistoryRepository,
    private readonly dataSource: DataSource,
  ) {}

  async listRelationships(
    primaryOrganizationId?: string,
    relatedOrganizationId?: string,
    relationshipType?: string,
    verified?: boolean,
  ): Promise<OrganizationRelationshipEntity[]> {
    if (primaryOrganizationId) {
      return this.organizationRelationshipRepository.findByPrimaryOrganizationId(primaryOrganizationId);
    }
    
    if (relatedOrganizationId) {
      return this.organizationRelationshipRepository.findByRelatedOrganizationId(relatedOrganizationId);
    }
    
    if (relationshipType) {
      return this.organizationRelationshipRepository.findByRelationshipType(relationshipType);
    }
    
    if (verified !== undefined) {
      if (verified) {
        return this.organizationRelationshipRepository.findVerifiedRelationships();
      } else {
        return this.organizationRelationshipRepository.findActiveRelationships();
      }
    }
    
    return this.organizationRelationshipRepository.find({
      where: { deleted_at: IsNull() },
      relations: ['primary_organization', 'related_organization', 'createdBy', 'verifiedBy'],
      order: { created_at: 'DESC' },
    });
  }

  async getRelationshipById(id: string): Promise<OrganizationRelationshipEntity> {
    const relationship = await this.organizationRelationshipRepository.findOne({
      where: { id, deleted_at: IsNull() },
      relations: ['primary_organization', 'related_organization', 'createdBy', 'verifiedBy'],
    });

    if (!relationship) {
      throw new NotFoundException('Organization relationship not found');
    }

    return relationship;
  }

  async createRelationship(
    dto: CreateOrganizationRelationshipDto,
  ): Promise<OrganizationRelationshipEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate that both organizations exist
      // Accept either sub-entity ID or main entity_id
      const primaryOrgRow = await queryRunner.manager.query(
        'SELECT oe.id, oe.entity_id FROM organization_entities oe WHERE (oe.id = $1 OR oe.entity_id = $1) AND oe.deleted_at IS NULL LIMIT 1',
        [dto.primary_organization_id]
      );
      const primaryOrg = primaryOrgRow?.[0]?.id ? { id: primaryOrgRow[0].id, entity_id: primaryOrgRow[0].entity_id } as any : null;

      const relatedOrgRow = await queryRunner.manager.query(
        'SELECT oe.id, oe.entity_id FROM organization_entities oe WHERE (oe.id = $1 OR oe.entity_id = $1) AND oe.deleted_at IS NULL LIMIT 1',
        [dto.related_organization_id]
      );
      const relatedOrg = relatedOrgRow?.[0]?.id ? { id: relatedOrgRow[0].id, entity_id: relatedOrgRow[0].entity_id } as any : null;

      if (!primaryOrg) {
        throw new BadRequestException('Primary organization not found');
      }

      if (!relatedOrg) {
        throw new BadRequestException('Related organization not found');
      }

      // Check if relationship already exists
      const existingRelationship = await queryRunner.manager.findOne(OrganizationRelationshipEntity, {
        where: {
          primary_organization_id: primaryOrg.id,
          related_organization_id: relatedOrg.id,
          relationship_type: dto.relationship_type,
          deleted_at: IsNull(),
        },
      });

      if (existingRelationship) {
        throw new BadRequestException('This organization relationship already exists');
      }

      // Create the relationship
      const relationship = queryRunner.manager.create(OrganizationRelationshipEntity, {
        primary_organization_id: primaryOrg.id,
        related_organization_id: relatedOrg.id,
        relationship_type: dto.relationship_type,
        ownership_percentage: dto.ownership_percentage,
        relationship_description: dto.relationship_description,
        effective_from: dto.effective_from || (new Date() as any),
        effective_to: dto.effective_to,
        verified: dto.verified ?? false,
        created_by: dto.created_by as any,
      });

      const savedRelationship = await queryRunner.manager.save(OrganizationRelationshipEntity, relationship);

      // Log the creation in entity history
      const history = queryRunner.manager.create(EntityHistoryEntity, {
        entity_id: primaryOrg.entity_id,
        changed_by: dto.created_by,
        change_type: 'created',
        change_description: 'Organization relationship created',
        new_values: {
          relationship_id: savedRelationship.id,
          related_organization_id: relatedOrg.id,
          relationship_type: dto.relationship_type,
          ownership_percentage: dto.ownership_percentage,
          relationship_description: dto.relationship_description,
        },
      });

      await queryRunner.manager.save(EntityHistoryEntity as any, history as any);

      await queryRunner.commitTransaction();

      return this.getRelationshipById(savedRelationship.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateRelationship(
    id: string,
    updates: Partial<CreateOrganizationRelationshipDto>,
    updatedBy: string,
  ): Promise<OrganizationRelationshipEntity> {
    const relationship = await this.getRelationshipById(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(OrganizationRelationshipEntity, id, updates);

      // Log the update in entity history
      const history = queryRunner.manager.create(EntityHistoryEntity, {
        entity_id: relationship.primary_organization_id,
        changed_by: updatedBy,
        change_type: 'updated',
        change_description: 'Organization relationship updated',
        new_values: updates,
      });

      await queryRunner.manager.save(EntityHistoryEntity as any, history as any);

      await queryRunner.commitTransaction();

      return this.getRelationshipById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateVerificationStatus(
    id: string,
    verified: boolean,
    verifiedBy: string,
  ): Promise<OrganizationRelationshipEntity> {
    const relationship = await this.getRelationshipById(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.organizationRelationshipRepository.updateVerificationStatus(
        id,
        verified,
        verifiedBy,
        new Date(),
      );

      // Log the verification in entity history
      const history = queryRunner.manager.create(EntityHistoryEntity as any, {
        entity_id: relationship.primary_organization_id,
        changed_by: verifiedBy,
        change_type: 'updated',
        change_description: verified ? 'Organization relationship verified' : 'Organization relationship unverified',
        new_values: {
          relationship_id: id,
          verified,
          verified_by: verifiedBy,
          verified_at: new Date(),
        },
      } as any);

      await queryRunner.manager.save(EntityHistoryEntity as any, history as any);

      await queryRunner.commitTransaction();

      return this.getRelationshipById(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getOrganizationRelationships(organizationId: string): Promise<OrganizationRelationshipEntity[]> {
    return this.organizationRelationshipRepository.findByOrganizationId(organizationId);
  }

  async getRelationshipStatistics(organizationId: string): Promise<any> {
    const relationships = await this.organizationRelationshipRepository.findByOrganizationId(organizationId);
    
    const stats: { total: number; verified: number; active: number; byType: Record<string, number> } = {
      total: relationships.length,
      verified: relationships.filter(r => r.verified).length,
      active: relationships.filter(r => {
        const now = new Date();
        return r.effective_from <= now && (!r.effective_to || r.effective_to >= now);
      }).length,
      byType: {},
    };

    relationships.forEach(relationship => {
      if (!stats.byType[relationship.relationship_type]) {
        stats.byType[relationship.relationship_type] = 0;
      }
      stats.byType[relationship.relationship_type]++;
    });

    return stats;
  }

  async deleteRelationship(id: string, deletedBy: string): Promise<void> {
    const relationship = await this.getRelationshipById(id);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.softDelete(OrganizationRelationshipEntity, id);

      // Log the deletion in entity history
      const history = queryRunner.manager.create(EntityHistoryEntity as any, {
        entity_id: relationship.primary_organization_id,
        changed_by: deletedBy,
        change_type: 'deleted',
        change_description: 'Organization relationship deleted',
        old_values: {
          relationship_id: id,
          related_organization_id: relationship.related_organization_id,
          relationship_type: relationship.relationship_type,
        },
      } as any);

      await queryRunner.manager.save(EntityHistoryEntity as any, history as any);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}