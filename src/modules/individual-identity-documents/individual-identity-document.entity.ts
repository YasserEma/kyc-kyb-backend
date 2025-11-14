import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { IndividualEntity } from '../entities/entities/individual-entity.entity';
import { DocumentEntity } from '../documents/entities/document.entity';

@Entity('individual_identity_documents')
export class IndividualIdentityDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  individual_id: string;

  @ManyToOne(() => IndividualEntity, (individual) => individual.identity_documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'individual_id' })
  individual: IndividualEntity;

  @Column({ type: 'varchar', length: 50 })
  id_type: string; // passport | national_id | e_id | drivers_license | other

  @Column({ type: 'varchar', length: 255, nullable: true })
  issuing_country?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  issuing_authority?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  id_number?: string;

  @Column({ type: 'boolean', default: false })
  is_encrypted: boolean;

  @Column({ type: 'date', nullable: true })
  issue_date?: Date;

  @Column({ type: 'date', nullable: true })
  expiry_date?: Date;

  // Phase 3: nationality of the identity document holder (ISO alpha-2)
  @Column({ type: 'varchar', length: 10, nullable: true })
  nationality?: string;

  @Column({ type: 'uuid', nullable: true })
  document_id?: string; // links to documents.id when a file is attached

  // One-to-one relation to DocumentEntity for attached file
  @OneToOne(() => DocumentEntity, { eager: false })
  @JoinColumn({ name: 'document_id' })
  document?: DocumentEntity;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // Phase 3: created_by subscriber user id
  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}