import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { EntityEntity } from '../../entities/entities/entity.entity';
import { SubscriberEntity } from '../../subscribers/entities/subscriber.entity';
import { SubscriberUserEntity } from '../../subscriber-users/entities/subscriber-user.entity';
import { DocumentConfigurationEntity } from '../../document-configurations/entities/document-configuration.entity';

@Entity('documents')
@Index(['entity_id'])
@Index(['subscriber_id'])
@Index(['document_type'])
@Index(['document_status'])
@Index(['verification_status'])
@Index(['is_sensitive'])
@Index(['expiry_date'])
export class DocumentEntity extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  entity_id: string;

  @Column({ type: 'uuid', nullable: true })
  subscriber_id: string;

  @Column({ type: 'varchar', length: 255 })
  document_name: string;

  @Column({ type: 'varchar', length: 100 })
  document_type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  document_subtype: string;

  @Column({ type: 'text', nullable: true })
  document_description: string;

  @Column({ type: 'varchar', length: 500 })
  file_path: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  storage_path: string;

  @Column({ type: 'varchar', length: 255 })
  file_name: string;

  @Column({ type: 'varchar', length: 255 })
  original_file_name: string;

  @Column({ type: 'varchar', length: 50 })
  file_extension: string;

  @Column({ type: 'varchar', length: 100 })
  mime_type: string;

  @Column({ type: 'bigint' })
  file_size: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  file_hash: string;

  @Column({ 
    type: 'enum', 
    enum: ['uploaded', 'processing', 'processed', 'verified', 'rejected', 'expired', 'archived'], 
    default: 'uploaded' 
  })
  document_status: 'uploaded' | 'processing' | 'processed' | 'verified' | 'rejected' | 'expired' | 'archived';

  @Column({ 
    type: 'enum', 
    enum: ['pending', 'in_progress', 'verified', 'rejected', 'expired'], 
    default: 'pending' 
  })
  verification_status: 'pending' | 'in_progress' | 'verified' | 'rejected' | 'expired';

  @Column({ type: 'boolean', default: false })
  is_sensitive: boolean;

  @Column({ type: 'boolean', default: false })
  is_encrypted: boolean;

  @Column({ type: 'boolean', default: false })
  is_required: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'date', nullable: true })
  issue_date: Date;

  @Column({ type: 'date', nullable: true })
  expiry_date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  issuing_authority: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  issuing_country: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  document_number: string;

  @Column({ type: 'text', nullable: true })
  verification_notes: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verified_by: string;

  @Column({ type: 'date', nullable: true })
  verification_date: Date;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rejected_by: string;

  @Column({ type: 'date', nullable: true })
  rejection_date: Date;

  @Column({ type: 'jsonb', nullable: true })
  extracted_data: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  ocr_data: Record<string, any>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence_score: number;

  @Column({ type: 'jsonb', nullable: true })
  validation_results: Record<string, any>;

  @Column({ type: 'varchar', length: 255, nullable: true })
  storage_provider: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  storage_reference: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  backup_location: string;

  @Column({ type: 'integer', default: 0 })
  download_count: number;

  @Column({ type: 'timestamp', nullable: true })
  last_accessed_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  last_accessed_by: string;

  @Column({ type: 'date', nullable: true })
  retention_until: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  retention_policy: string;

  @Column({ type: 'text', nullable: true })
  tags: string;

  @Column({ type: 'uuid', nullable: true })
  uploaded_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Relationships
  @ManyToOne(() => EntityEntity, entity => entity.documents)
  @JoinColumn({ name: 'entity_id' })
  entity: EntityEntity;

  @ManyToOne(() => SubscriberEntity, subscriber => subscriber.documents)
  @JoinColumn({ name: 'subscriber_id' })
  subscriber: SubscriberEntity;

  @ManyToOne(() => SubscriberUserEntity)
  @JoinColumn({ name: 'uploaded_by' })
  uploader: SubscriberUserEntity;

  @Column({ type: 'uuid', nullable: true })
  document_configuration_id: string;

  @ManyToOne(() => DocumentConfigurationEntity)
  @JoinColumn({ name: 'document_configuration_id' })
  document_configuration: DocumentConfigurationEntity;

  // Virtual properties
  get is_expired(): boolean {
    return this.expiry_date && this.expiry_date < new Date();
  }

  get is_expiring_soon(): boolean {
    if (!this.expiry_date) return false;
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return this.expiry_date <= thirtyDaysFromNow;
  }

  get is_valid(): boolean {
    return this.verification_status === 'verified' && 
           this.document_status !== 'rejected' && 
           !this.is_expired;
  }

  get file_size_mb(): number {
    return Math.round((this.file_size / (1024 * 1024)) * 100) / 100;
  }

  get age_days(): number | null {
    if (!this.issue_date) return null;
    
    const diffTime = new Date().getTime() - this.issue_date.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get days_until_expiry(): number | null {
    if (!this.expiry_date) return null;
    
    const diffTime = this.expiry_date.getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get validity_period_days(): number | null {
    if (!this.issue_date || !this.expiry_date) return null;
    
    const diffTime = this.expiry_date.getTime() - this.issue_date.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get processing_time_hours(): number | null {
    if (this.document_status === 'uploaded' || !this.updated_at) return null;
    
    const diffTime = this.updated_at.getTime() - this.created_at.getTime();
    return Math.round((diffTime / (1000 * 60 * 60)) * 100) / 100;
  }

  get verification_time_hours(): number | null {
    if (!this.verification_date) return null;
    
    const diffTime = this.verification_date.getTime() - this.created_at.getTime();
    return Math.round((diffTime / (1000 * 60 * 60)) * 100) / 100;
  }

  get status_summary(): string {
    const statuses: string[] = [];
    
    statuses.push(`Document: ${this.document_status}`);
    statuses.push(`Verification: ${this.verification_status}`);
    
    if (this.is_expired) statuses.push('Expired');
    else if (this.is_expiring_soon) statuses.push('Expiring Soon');
    
    if (this.is_sensitive) statuses.push('Sensitive');
    if (this.is_encrypted) statuses.push('Encrypted');
    if (this.is_required) statuses.push('Required');
    
    return statuses.join(', ');
  }

  get compliance_flags(): string[] {
    const flags: string[] = [];
    
    if (this.is_expired) flags.push('Expired');
    if (this.is_expiring_soon) flags.push('Expiring Soon');
    if (this.verification_status === 'rejected') flags.push('Verification Rejected');
    if (this.verification_status === 'pending' && this.is_required) flags.push('Required Verification Pending');
    if (this.is_sensitive && !this.is_encrypted) flags.push('Sensitive Data Not Encrypted');
    if (this.confidence_score && this.confidence_score < 0.8) flags.push('Low Confidence Score');
    if (this.retention_until && this.retention_until < new Date()) flags.push('Retention Period Expired');
    
    return flags;
  }

  get tag_list(): string[] {
    if (!this.tags) return [];
    return this.tags.split(',').map(tag => tag.trim()).filter(Boolean);
  }

  set tag_list(tags: string[]) {
    this.tags = tags.join(', ');
  }

  get display_name(): string {
    return this.document_name || this.original_file_name || this.file_name;
  }

  get security_level(): 'low' | 'medium' | 'high' | 'critical' {
    if (this.is_sensitive && this.document_type.includes('passport')) return 'critical';
    if (this.is_sensitive) return 'high';
    if (this.document_type.includes('financial') || this.document_type.includes('bank')) return 'medium';
    return 'low';
  }
}