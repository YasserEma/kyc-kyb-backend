import { Entity, Column, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { EntityEntity } from '../../entities/entities/entity.entity';

@Entity('entity_relationships')
@Index(['from_entity_id'])
@Index(['to_entity_id'])
@Index(['relationship_type'])
@Index(['is_active'])
@Unique('UQ_entity_relationship_active', ['from_entity_id', 'to_entity_id', 'relationship_type', 'is_active'])
export class EntityRelationship extends BaseEntity {
    @Column({ type: 'uuid' })
    from_entity_id!: string;

    @Column({ type: 'uuid' })
    to_entity_id!: string;

    @ManyToOne(() => EntityEntity, { nullable: false })
    @JoinColumn({ name: 'from_entity_id' })
    from_entity: EntityEntity;

    @ManyToOne(() => EntityEntity, { nullable: false })
    @JoinColumn({ name: 'to_entity_id' })
    to_entity: EntityEntity;

    @Column({ type: 'text' })
    relationship_type!: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata?: Record<string, any>;

    @Column({ type: 'timestamp', nullable: true })
    start_date?: Date;

    @Column({ type: 'timestamp', nullable: true })
    end_date?: Date;

    // Note: is_active, deleted_at, created_at, updated_at are inherited from BaseEntity
}
