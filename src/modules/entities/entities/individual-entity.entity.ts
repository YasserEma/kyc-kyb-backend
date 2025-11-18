import { Entity, Column, OneToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { EntityEntity } from './entity.entity';
import { OrganizationEntityAssociationEntity } from '../../organization-entity-associations/entities/organization-entity-association.entity';
import { IndividualEntityRelationshipEntity } from '../../individual-entity-relationships/entities/individual-entity-relationship.entity';
import { IndividualIdentityDocumentEntity } from '../../individual-identity-documents/individual-identity-document.entity';

@Entity('individual_entities')
export class IndividualEntity extends BaseEntity {
  @OneToOne(() => EntityEntity)
  @JoinColumn({ name: 'entity_id' })
  entity!: EntityEntity;

  @Column({ type: 'uuid', unique: true })
  entity_id!: string;

  @Column({ type: 'date' })
  date_of_birth!: Date;

  @Column({ type: 'jsonb', default: [] })
  nationality!: any[];

  @Column({ type: 'jsonb', nullable: true, default: [] })
  country_of_residence?: any[];

  @Index('idx_individual_entities_gender')
  @Column({ type: 'text', nullable: true })
  gender?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'text', nullable: true })
  occupation?: string;

  @OneToMany(() => IndividualIdentityDocumentEntity, (doc) => doc.individual)
  identity_documents?: IndividualIdentityDocumentEntity[];

  @Column({ type: 'text', nullable: true })
  source_of_income?: string;

  @Column({ type: 'boolean', default: false })
  is_pep!: boolean;

  @Column({ type: 'boolean', default: false })
  has_criminal_record!: boolean;

  @Column({ type: 'text', nullable: true })
  pep_details?: string;

  @Column({ type: 'text', nullable: true })
  criminal_record_details?: string;

  @OneToMany(() => OrganizationEntityAssociationEntity, association => association.individual)
  organization_associations: OrganizationEntityAssociationEntity[];

  @OneToMany(() => IndividualEntityRelationshipEntity, relationship => relationship.primary_individual)
  primary_relationships: IndividualEntityRelationshipEntity[];

  @OneToMany(() => IndividualEntityRelationshipEntity, relationship => relationship.related_individual)
  related_relationships: IndividualEntityRelationshipEntity[];

  // Computed property for full name
  get full_name(): string {
    return this.entity?.name || '';
  }
}