import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EntityRelationshipRepository } from '../repositories/entity-relationship.repository';
import { EntityRepository } from '../../entities/repositories/entity.repository';
import { EntityHistoryRepository } from '../../entity-history/repositories/entity-history.repository';
import { EntitiesService } from '../../entities/services/entities.service';
import { CreateUnifiedRelationshipDto } from '../dtos/create-unified-relationship.dto';
import { UpdateRelationshipDto } from '../dtos/update-relationship.dto';
import { EntityRelationship } from '../entities/entity-relationship.entity';
import { CreateIndividualEntityDto } from '../../entities/dtos/create-individual-entity.dto';
import { CreateOrganizationEntityDto } from '../../entities/dtos/create-organization-entity.dto';

@Injectable()
export class EntityRelationshipsService {
    constructor(
        private readonly dataSource: DataSource,
        private readonly relationshipRepository: EntityRelationshipRepository,
        private readonly entityRepository: EntityRepository,
        private readonly entityHistoryRepository: EntityHistoryRepository,
        private readonly entitiesService: EntitiesService,
    ) { }

    /**
     * Create a new relationship from source entity to target entity
     * Supports both linking to existing entities and creating new entities on-the-fly
     */
    async createRelationship(
        subscriberId: string,
        sourceEntityId: string,
        userId: string,
        dto: CreateUnifiedRelationshipDto
    ): Promise<EntityRelationship> {
        // Validate that exactly one target method is provided
        if (dto.target_entity_id && dto.new_target_entity) {
            throw new BadRequestException(
                'Cannot specify both target_entity_id and new_target_entity. Choose one.'
            );
        }

        if (!dto.target_entity_id && !dto.new_target_entity) {
            throw new BadRequestException(
                'Must specify either target_entity_id or new_target_entity'
            );
        }

        return this.dataSource.transaction(async (manager) => {
            // 1. Validate source entity exists
            const sourceEntity = await this.entityRepository.findById(sourceEntityId);

            if (!sourceEntity || sourceEntity.subscriber_id !== subscriberId) {
                throw new NotFoundException(`Source entity ${sourceEntityId} not found`);
            }

            // 2. Resolve or create target entity
            let targetEntityId: string;

            if (dto.target_entity_id) {
                // Scenario 1: Link to existing entity
                const targetEntity = await this.entityRepository.findById(dto.target_entity_id);
                if (!targetEntity || targetEntity.subscriber_id !== subscriberId) {
                    throw new NotFoundException(`Target entity ${dto.target_entity_id} not found`);
                }
                targetEntityId = dto.target_entity_id;
            } else {
                // Scenario 2: Create new entity inline
                const newEntityData = dto.new_target_entity!;

                // Determine entity type based on DTO structure
                const isIndividual = 'date_of_birth' in newEntityData;
                const isOrganization = 'country_of_incorporation' in newEntityData;

                if (!isIndividual && !isOrganization) {
                    throw new BadRequestException(
                        'new_target_entity must contain either date_of_birth (for Individual) or country_of_incorporation (for Organization)'
                    );
                }

                let createdEntity;
                if (isIndividual) {
                    createdEntity = await this.entitiesService.createIndividualEntity(
                        subscriberId,
                        userId,
                        newEntityData as CreateIndividualEntityDto
                    );
                } else {
                    createdEntity = await this.entitiesService.createOrganizationEntity(
                        subscriberId,
                        userId,
                        newEntityData as CreateOrganizationEntityDto
                    );
                }

                targetEntityId = createdEntity.id;
            }

            // 3. Check for duplicate active relationship
            const existingRelationship = await this.relationshipRepository.checkDuplicateRelationship(
                sourceEntityId,
                targetEntityId,
                dto.relationship_type
            );

            if (existingRelationship) {
                throw new ConflictException(
                    `An active ${dto.relationship_type} relationship already exists between these entities`
                );
            }

            // 4. Create the relationship
            const relationship = this.relationshipRepository.create({
                from_entity_id: sourceEntityId,
                to_entity_id: targetEntityId,
                relationship_type: dto.relationship_type,
                metadata: dto.metadata,
                start_date: dto.start_date ? new Date(dto.start_date) : undefined,
                end_date: dto.end_date ? new Date(dto.end_date) : undefined,
                is_active: true,
            });

            const savedRelationship = await manager
                .getRepository(EntityRelationship)
                .save(relationship);

            // 5. Log to entity history for the source entity
            await manager.getRepository((this.entityHistoryRepository as any).repository.target).save(
                this.entityHistoryRepository.create({
                    entity_id: sourceEntityId,
                    changed_by: userId,
                    change_type: 'updated',
                    change_description: `Created ${dto.relationship_type} relationship`,
                    new_values: {
                        relationship_id: savedRelationship.id,
                        target_entity_id: targetEntityId,
                        relationship_type: dto.relationship_type,
                        metadata: dto.metadata,
                    },
                })
            );

            // 6. Return relationship with populated entities
            return manager.getRepository(EntityRelationship).findOne({
                where: { id: savedRelationship.id },
                relations: ['from_entity', 'to_entity'],
            }) as Promise<EntityRelationship>;
        });
    }

    /**
     * Update an existing relationship
     * Note: Entity IDs cannot be changed (relationships are immutable in terms of who is connected)
     */
    async updateRelationship(
        subscriberId: string,
        relationshipId: string,
        userId: string,
        dto: UpdateRelationshipDto
    ): Promise<EntityRelationship> {
        const relationship = await this.relationshipRepository.findById(relationshipId);

        if (!relationship) {
            throw new NotFoundException(`Relationship ${relationshipId} not found`);
        }

        // Verify the relationship belongs to this subscriber
        if (
            relationship.from_entity.subscriber_id !== subscriberId ||
            relationship.to_entity.subscriber_id !== subscriberId
        ) {
            throw new NotFoundException('Relationship not found');
        }

        return this.dataSource.transaction(async (manager) => {
            const oldValues = {
                relationship_type: relationship.relationship_type,
                metadata: relationship.metadata,
                start_date: relationship.start_date,
                end_date: relationship.end_date,
                is_active: relationship.is_active,
            };

            // Update allowed fields
            const updatedData: Partial<EntityRelationship> = {};
            if (dto.relationship_type !== undefined) updatedData.relationship_type = dto.relationship_type;
            if (dto.metadata !== undefined) updatedData.metadata = dto.metadata;
            if (dto.start_date !== undefined) updatedData.start_date = new Date(dto.start_date);
            if (dto.end_date !== undefined) updatedData.end_date = new Date(dto.end_date);
            if (dto.is_active !== undefined) updatedData.is_active = dto.is_active;

            await manager.getRepository(EntityRelationship).update(relationshipId, updatedData);

            // Log to entity history
            await manager.getRepository((this.entityHistoryRepository as any).repository.target).save(
                this.entityHistoryRepository.create({
                    entity_id: relationship.from_entity_id,
                    changed_by: userId,
                    change_type: 'updated',
                    change_description: 'Updated entity relationship',
                    old_values: oldValues,
                    new_values: updatedData,
                })
            );

            return this.relationshipRepository.findById(relationshipId) as Promise<EntityRelationship>;
        });
    }

    /**
     * Soft delete a relationship
     */
    async deleteRelationship(
        subscriberId: string,
        relationshipId: string,
        userId: string
    ): Promise<{ message: string }> {
        const relationship = await this.relationshipRepository.findById(relationshipId);

        if (!relationship) {
            throw new NotFoundException(`Relationship ${relationshipId} not found`);
        }

        // Verify the relationship belongs to this subscriber
        if (
            relationship.from_entity.subscriber_id !== subscriberId ||
            relationship.to_entity.subscriber_id !== subscriberId
        ) {
            throw new NotFoundException('Relationship not found');
        }

        return this.dataSource.transaction(async (manager) => {
            // Soft delete
            await manager.getRepository(EntityRelationship).softDelete(relationshipId);

            // Log to entity history
            await manager.getRepository((this.entityHistoryRepository as any).repository.target).save(
                this.entityHistoryRepository.create({
                    entity_id: relationship.from_entity_id,
                    changed_by: userId,
                    change_type: 'deleted',
                    change_description: `Deleted ${relationship.relationship_type} relationship`,
                    old_values: {
                        relationship_id: relationshipId,
                        target_entity_id: relationship.to_entity_id,
                        relationship_type: relationship.relationship_type,
                    },
                })
            );

            return { message: 'Relationship deleted successfully' };
        });
    }

    /**
     * Find all relationships for an entity (both as source and target)
     */
    async findRelationshipsByEntity(
        subscriberId: string,
        entityId: string,
        activeOnly: boolean = false
    ): Promise<EntityRelationship[]> {
        // Verify entity exists and belongs to subscriber
        const entity = await this.entityRepository.findById(entityId);
        if (!entity || entity.subscriber_id !== subscriberId) {
            throw new NotFoundException(`Entity ${entityId} not found`);
        }

        if (activeOnly) {
            return this.relationshipRepository.findActiveRelationships(entityId);
        }

        return this.relationshipRepository.findByEntityId(entityId);
    }

    /**
     * Get a specific relationship by ID
     */
    async getRelationshipById(
        subscriberId: string,
        relationshipId: string
    ): Promise<EntityRelationship> {
        const relationship = await this.relationshipRepository.findById(relationshipId);

        if (!relationship) {
            throw new NotFoundException(`Relationship ${relationshipId} not found`);
        }

        // Verify the relationship belongs to this subscriber
        if (
            relationship.from_entity.subscriber_id !== subscriberId ||
            relationship.to_entity.subscriber_id !== subscriberId
        ) {
            throw new NotFoundException('Relationship not found');
        }

        return relationship;
    }
}
