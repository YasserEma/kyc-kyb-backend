import { Entity, Column, OneToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { EntityEntity } from './entity.entity';

@Entity('organization_entities')
export class OrganizationEntity extends BaseEntity {
  @OneToOne(() => EntityEntity)
  @JoinColumn({ name: 'entity_id' })
  entity!: EntityEntity;

  @Column({ type: 'uuid', unique: true })
  entity_id!: string;

  @Column({ type: 'text' })
  legal_name!: string;

  @Column({ type: 'text', nullable: true })
  trade_name?: string;

  @Index('idx_organization_entities_country')
  @Column({ type: 'text' })
  country_of_incorporation!: string;

  @Column({ type: 'date' })
  date_of_incorporation!: Date;

  @Index('idx_organization_entities_org_type')
  @Column({ type: 'text', nullable: true })
  organization_type?: string;

  @Column({ type: 'text', nullable: true })
  legal_structure?: string;

  @Column({ type: 'text', nullable: true })
  tax_identification_number?: string;

  @Column({ type: 'text', nullable: true })
  commercial_registration_number?: string;

  @Column({ type: 'text', nullable: true })
  registered_address?: string;

  @Column({ type: 'text', nullable: true })
  operating_address?: string;

  @Column({ type: 'text', nullable: true })
  contact_email?: string;

  @Column({ type: 'text', nullable: true })
  contact_phone?: string;

  @Column({ type: 'text', nullable: true })
  industry_sector?: string;

  @Column({ type: 'int', nullable: true })
  number_of_employees?: number;

  @Column({ type: 'decimal', nullable: true })
  annual_revenue?: string;
}