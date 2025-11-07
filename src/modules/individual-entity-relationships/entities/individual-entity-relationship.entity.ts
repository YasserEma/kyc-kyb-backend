import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { IndividualEntity } from '../../entities/entities/individual-entity.entity';
import { SubscriberUserEntity } from '../../subscriber-users/entities/subscriber-user.entity';

@Entity('individual_relationships')
@Index(['primary_individual_id'])
@Index(['related_individual_id'])
@Index(['relationship_type'])
export class IndividualEntityRelationshipEntity extends BaseEntity {
  @Column({ type: 'uuid', nullable: false })
  primary_individual_id: string;

  @Column({ type: 'uuid', nullable: false })
  related_individual_id: string;

  @Column({ type: 'text', nullable: false })
  relationship_type: string;

  @Column({ type: 'text', nullable: true })
  relationship_description: string;

  @Column({ type: 'text', nullable: true })
  relationship_status: string;

  @Column({ type: 'date', nullable: false })
  effective_from: Date;

  @Column({ type: 'date', nullable: true })
  effective_to: Date;

  @Column({ type: 'date', nullable: false })
  relationship_start_date: Date;

  @Column({ type: 'date', nullable: true })
  relationship_end_date: Date;

  @Column({ type: 'boolean', nullable: false, default: false })
  verified: boolean;

  @Column({ type: 'uuid', nullable: true })
  verified_by: string;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  verification_date: Date | null;

  @Column({ type: 'text', nullable: true })
  verification_method: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_verified: boolean;

  @Column({ type: 'text', nullable: true })
  verification_status: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_primary: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_reciprocal: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_pep_related: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_sanctions_related: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  requires_enhanced_due_diligence: boolean;

  @Column({ type: 'text', nullable: true })
  risk_level: string;

  @Column({ type: 'text', nullable: true })
  risk_factors: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_high_risk: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  needs_review: boolean;

  @Column({ type: 'timestamp', nullable: true })
  last_reviewed_date: Date;

  @Column({ type: 'uuid', nullable: true })
  reviewed_by: string;

  @Column({ type: 'date', nullable: true })
  next_review_date: Date;

  @Column({ type: 'numeric', nullable: true })
  ownership_percentage: number;

  @Column({ type: 'text', nullable: true })
  legal_basis: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'uuid', nullable: false })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  // Relationships
  @ManyToOne(() => IndividualEntity, individual => individual.primary_relationships)
  @JoinColumn({ name: 'primary_individual_id' })
  primary_individual: IndividualEntity;

  @ManyToOne(() => IndividualEntity, individual => individual.related_relationships)
  @JoinColumn({ name: 'related_individual_id' })
  related_individual: IndividualEntity;

  @ManyToOne(() => SubscriberUserEntity)
  @JoinColumn({ name: 'created_by' })
  createdBy: SubscriberUserEntity;

  @ManyToOne(() => SubscriberUserEntity)
  @JoinColumn({ name: 'verified_by' })
  verifiedBy: SubscriberUserEntity;

  @ManyToOne(() => SubscriberUserEntity)
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy: SubscriberUserEntity;

  @ManyToOne(() => SubscriberUserEntity)
  @JoinColumn({ name: 'updated_by' })
  updatedBy: SubscriberUserEntity;
}