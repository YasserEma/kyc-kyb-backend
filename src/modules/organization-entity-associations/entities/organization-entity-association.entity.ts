import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { OrganizationEntity } from '../../entities/entities/organization-entity.entity';
import { IndividualEntity } from '../../entities/entities/individual-entity.entity';
import { SubscriberUserEntity } from '../../subscriber-users/entities/subscriber-user.entity';

@Entity('organization_associations')
@Index(['organization_id'])
@Index(['individual_id'])
@Index(['relationship_type'])
export class OrganizationEntityAssociationEntity extends BaseEntity {
  @Column({ type: 'uuid', nullable: false })
  organization_id: string;

  @Column({ type: 'uuid', nullable: false })
  individual_id: string;

  @Column({ type: 'text', nullable: false })
  relationship_type: string;

  // Association metadata
  @Column({ type: 'text', nullable: true })
  association_type: string;

  @Column({ type: 'text', nullable: true })
  association_status: string;

  @Column({ type: 'text', nullable: true })
  ownership_type: string;

  @Column({ type: 'decimal', nullable: true })
  ownership_percentage: number;

  @Column({ type: 'decimal', nullable: true })
  voting_rights_percentage: number;

  @Column({ type: 'text', nullable: true })
  position_title: string;

  @Column({ type: 'text', nullable: true })
  association_description: string;

  @Column({ type: 'date', nullable: false })
  effective_from: Date;

  @Column({ type: 'date', nullable: true })
  effective_to: Date;

  // Alternate start/end names used in repositories
  @Column({ type: 'date', nullable: true })
  association_start_date: Date;

  @Column({ type: 'date', nullable: true })
  association_end_date: Date;

  @Column({ type: 'boolean', nullable: false, default: false })
  verified: boolean;

  // Preferred set used in repositories
  @Column({ type: 'boolean', nullable: false, default: false })
  is_verified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  verification_date: Date | null;

  @Column({ type: 'text', nullable: true })
  verification_method: string;

  @Column({ type: 'uuid', nullable: true })
  verified_by: string;

  @Column({ type: 'timestamp', nullable: true })
  verified_at: Date;

  // Risk and control signals
  @Column({ type: 'text', nullable: true })
  risk_level: string;

  @Column({ type: 'text', nullable: true })
  risk_factors: string;

  @Column({ type: 'text', nullable: true })
  control_level: string;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_beneficial_owner: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_ultimate_beneficial_owner: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_authorized_signatory: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_key_management_personnel: boolean;

  @Column({ type: 'boolean', nullable: false, default: false })
  is_significant_control: boolean;

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

  @Column({ type: 'uuid', nullable: false })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  // Relationships
  @ManyToOne(() => OrganizationEntity, { eager: false })
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @ManyToOne(() => IndividualEntity, { eager: false })
  @JoinColumn({ name: 'individual_id' })
  individual: IndividualEntity;

  @ManyToOne(() => SubscriberUserEntity, { eager: false })
  @JoinColumn({ name: 'created_by' })
  createdBy: SubscriberUserEntity;

  @ManyToOne(() => SubscriberUserEntity, { eager: false })
  @JoinColumn({ name: 'verified_by' })
  verifiedBy: SubscriberUserEntity;
}