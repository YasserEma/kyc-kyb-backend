import { Injectable } from '@nestjs/common';
import { DataSource, Repository, In } from 'typeorm';
import { EntityRelationship } from '../entities/entity-relationship.entity';

@Injectable()
export class EntityRelationshipRepository {
    private repository: Repository<EntityRelationship>;

    constructor(private readonly dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(EntityRelationship);
    }

    create(data: Partial<EntityRelationship>): EntityRelationship {
        return this.repository.create(data);
    }

    async save(relationship: EntityRelationship): Promise<EntityRelationship> {
        return this.repository.save(relationship);
    }

    async findById(id: string): Promise<EntityRelationship | null> {
        return this.repository.findOne({
            where: { id },
            relations: ['from_entity', 'to_entity'],
        });
    }

    /**
     * Find all relationships for a given entity (both as source and target)
     */
    async findByEntityId(entityId: string): Promise<EntityRelationship[]> {
        return this.repository
            .createQueryBuilder('rel')
            .leftJoinAndSelect('rel.from_entity', 'from_entity')
            .leftJoinAndSelect('rel.to_entity', 'to_entity')
            .where('rel.from_entity_id = :entityId OR rel.to_entity_id = :entityId', { entityId })
            .andWhere('rel.deleted_at IS NULL')
            .orderBy('rel.created_at', 'DESC')
            .getMany();
    }

    /**
     * Find only active relationships for a given entity
     */
    async findActiveRelationships(entityId: string): Promise<EntityRelationship[]> {
        return this.repository
            .createQueryBuilder('rel')
            .leftJoinAndSelect('rel.from_entity', 'from_entity')
            .leftJoinAndSelect('rel.to_entity', 'to_entity')
            .where('rel.from_entity_id = :entityId OR rel.to_entity_id = :entityId', { entityId })
            .andWhere('rel.is_active = :active', { active: true })
            .andWhere('rel.deleted_at IS NULL')
            .orderBy('rel.created_at', 'DESC')
            .getMany();
    }

    /**
     * Check if a duplicate active relationship already exists
     */
    async checkDuplicateRelationship(
        fromEntityId: string,
        toEntityId: string,
        relationshipType: string
    ): Promise<EntityRelationship | null> {
        return this.repository.findOne({
            where: {
                from_entity_id: fromEntityId,
                to_entity_id: toEntityId,
                relationship_type: relationshipType,
                is_active: true,
            },
        });
    }

    /**
     * Soft delete a relationship
     */
    async softDelete(id: string): Promise<void> {
        await this.repository.softDelete(id);
    }

    /**
     * Update a relationship
     */
    async update(id: string, data: Partial<EntityRelationship>): Promise<void> {
        await this.repository.update(id, data);
    }
}
