import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ListEntity } from './list.entity';
import { SubscriberUserEntity } from '../../subscriber-users/entities/subscriber-user.entity';

@Entity('list_values')
export class ListValueEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  list_id: string;

  @Column({ type: 'varchar', length: 500 })
  value: string;

  @Column({ type: 'varchar', length: 50 })
  value_type: string; // 'name', 'email', 'phone', 'address', 'id_number', 'account_number', 'ip_address', 'domain', 'custom'

  @Column({ type: 'varchar', length: 500, nullable: true })
  normalized_value: string;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string; // 'active', 'inactive', 'pending', 'expired', 'flagged'

  @Column({ type: 'varchar', length: 50, nullable: true })
  match_type: string; // 'exact', 'partial', 'fuzzy', 'regex', 'phonetic'

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  match_threshold: number; // For fuzzy matching

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'boolean', default: false })
  is_false_positive: boolean;

  @Column({ type: 'boolean', default: false })
  is_whitelisted: boolean;

  @Column({ type: 'boolean', default: false })
  is_encrypted: boolean;

  @Column({ type: 'boolean', default: false })
  is_sensitive: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  risk_level: string; // 'low', 'medium', 'high', 'critical'

  @Column({ type: 'varchar', length: 50, nullable: true })
  confidence_level: string; // 'low', 'medium', 'high'

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  confidence_score: number; // 0-100

  @Column({ type: 'varchar', length: 100, nullable: true })
  source: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  source_reference: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  source_version: string;

  @Column({ type: 'timestamp', nullable: true })
  source_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  verified_date: Date;

  @Column({ type: 'uuid', nullable: true })
  verified_by: string;

  @Column({ type: 'text', nullable: true })
  verification_notes: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subcategory: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  jurisdiction: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  regulatory_framework: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  reason_for_listing: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  additional_data: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  aliases: string[];

  @Column({ type: 'jsonb', nullable: true })
  match_history: any[];

  @Column({ type: 'jsonb', nullable: true })
  review_history: any[];

  @Column({ type: 'jsonb', nullable: true })
  related_identifiers: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'timestamp', nullable: true })
  effective_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiry_date: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_matched_date: Date;

  @Column({ type: 'int', default: 0 })
  match_count: number;

  @Column({ type: 'timestamp', nullable: true })
  last_reviewed_date: Date;

  @Column({ type: 'uuid', nullable: true })
  reviewed_by: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  review_status: string; // 'pending', 'approved', 'rejected', 'requires_update'

  @Column({ type: 'text', nullable: true })
  review_notes: string;

  @Column({ type: 'timestamp', nullable: true })
  next_review_date: Date;

  @Column({ type: 'int', nullable: true })
  review_frequency_days: number;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @Column({ type: 'uuid', nullable: true })
  updated_by: string;

  @Column({ type: 'uuid', nullable: true })
  approved_by: string;

  @Column({ type: 'timestamp', nullable: true })
  approved_date: Date;

  @Column({ type: 'text', nullable: true })
  approval_notes: string;

  @Column({ type: 'uuid', nullable: true })
  flagged_by: string;

  @Column({ type: 'timestamp', nullable: true })
  flagged_date: Date;

  @Column({ type: 'varchar', length: 200, nullable: true })
  flag_reason: string;

  @Column({ type: 'text', nullable: true })
  flag_notes: string;

  @Column({ type: 'int', default: 0 })
  version: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @ManyToOne(() => ListEntity, list => list.list_values)
  @JoinColumn({ name: 'list_id' })
  list: ListEntity;

  @ManyToOne(() => SubscriberUserEntity, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: SubscriberUserEntity;

  @ManyToOne(() => SubscriberUserEntity, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updater: SubscriberUserEntity;

  @ManyToOne(() => SubscriberUserEntity, { nullable: true })
  @JoinColumn({ name: 'verified_by' })
  verifier: SubscriberUserEntity;

  @ManyToOne(() => SubscriberUserEntity, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: SubscriberUserEntity;

  @ManyToOne(() => SubscriberUserEntity, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: SubscriberUserEntity;

  @ManyToOne(() => SubscriberUserEntity, { nullable: true })
  @JoinColumn({ name: 'flagged_by' })
  flagger: SubscriberUserEntity;

  // Virtual properties
  get is_expired(): boolean {
    return this.expiry_date ? new Date() > this.expiry_date : false;
  }

  get is_effective(): boolean {
    const now = new Date();
    const effectiveCheck = this.effective_date ? now >= this.effective_date : true;
    const expiryCheck = this.expiry_date ? now <= this.expiry_date : true;
    return effectiveCheck && expiryCheck;
  }

  get is_verified_and_active(): boolean {
    return this.is_verified && this.is_active && this.is_effective;
  }

  get is_flagged(): boolean {
    return this.status === 'flagged' || !!this.flagged_by;
  }

  get is_pending_review(): boolean {
    return this.review_status === 'pending' || (this.next_review_date && new Date() > this.next_review_date);
  }

  get is_overdue_review(): boolean {
    return this.next_review_date ? new Date() > this.next_review_date : false;
  }

  get is_high_risk(): boolean {
    return this.risk_level === 'high' || this.risk_level === 'critical';
  }

  get is_low_confidence(): boolean {
    return this.confidence_level === 'low' || (this.confidence_score !== null && this.confidence_score < 50);
  }

  get days_until_expiry(): number | null {
    if (!this.expiry_date) return null;
    const diffTime = this.expiry_date.getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get age_in_days(): number {
    const diffTime = new Date().getTime() - this.created_at.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  get days_since_last_match(): number | null {
    if (!this.last_matched_date) return null;
    const diffTime = new Date().getTime() - this.last_matched_date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  get days_since_last_review(): number | null {
    if (!this.last_reviewed_date) return null;
    const diffTime = new Date().getTime() - this.last_reviewed_date.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  get match_frequency(): number {
    if (!this.last_matched_date || this.match_count === 0) return 0;
    const daysSinceCreation = this.age_in_days;
    return daysSinceCreation > 0 ? this.match_count / daysSinceCreation : 0;
  }

  get status_summary(): string {
    if (!this.is_active) return 'inactive';
    if (this.is_expired) return 'expired';
    if (!this.is_effective) return 'not_effective';
    if (this.is_flagged) return 'flagged';
    if (this.is_false_positive) return 'false_positive';
    if (this.is_whitelisted) return 'whitelisted';
    if (this.is_pending_review) return 'pending_review';
    if (!this.is_verified) return 'unverified';
    return 'active';
  }

  get risk_flags(): string[] {
    const flags: string[] = [];
    
    if (this.is_high_risk) flags.push('high_risk');
    if (this.is_sensitive) flags.push('sensitive_data');
    if (this.is_low_confidence) flags.push('low_confidence');
    if (this.is_flagged) flags.push('flagged');
    if (this.is_expired) flags.push('expired');
    if (!this.is_effective) flags.push('not_effective');
    if (!this.is_verified) flags.push('unverified');
    if (this.is_overdue_review) flags.push('overdue_review');
    
    return flags;
  }

  get compliance_flags(): string[] {
    const flags: string[] = [];
    
    if (this.regulatory_framework) flags.push('regulatory_compliance');
    if (this.jurisdiction) flags.push('jurisdiction_specific');
    if (this.is_pending_review) flags.push('review_required');
    if (this.reason_for_listing) flags.push('documented_reason');
    
    return flags;
  }

  get alias_list(): string {
    return this.aliases ? this.aliases.join(', ') : '';
  }

  get tag_list(): string {
    return this.tags ? this.tags.join(', ') : '';
  }

  get display_value(): string {
    return this.normalized_value || this.value;
  }

  get display_name(): string {
    return `${this.display_value} (${this.value_type})`;
  }

  get risk_score(): number {
    const riskMap = { low: 25, medium: 50, high: 75, critical: 100 };
    return riskMap[this.risk_level as keyof typeof riskMap] || 0;
  }

  get effective_confidence_score(): number {
    if (this.confidence_score !== null) return this.confidence_score;
    
    const confidenceMap = { low: 30, medium: 60, high: 90 };
    return confidenceMap[this.confidence_level as keyof typeof confidenceMap] || 50;
  }

  get data_quality_score(): number {
    let score = 100;
    
    // Deduct points for missing critical information
    if (!this.normalized_value) score -= 10;
    if (!this.value_type) score -= 15;
    if (!this.source) score -= 10;
    if (!this.category) score -= 5;
    if (!this.risk_level) score -= 10;
    if (!this.confidence_level && this.confidence_score === null) score -= 10;
    if (!this.is_verified) score -= 15;
    if (this.is_low_confidence) score -= 10;
    if (this.is_flagged) score -= 20;
    if (this.is_overdue_review) score -= 10;
    
    return Math.max(0, score);
  }

  get match_effectiveness(): number {
    if (this.match_count === 0) return 0;
    
    // Calculate effectiveness based on match frequency and false positive rate
    const baseScore = Math.min(this.match_frequency * 10, 100);
    const falsePositivePenalty = this.is_false_positive ? 50 : 0;
    
    return Math.max(0, baseScore - falsePositivePenalty);
  }

  get priority_level(): number {
    let priority = 0;
    
    // Risk level contribution
    if (this.risk_level === 'critical') priority += 40;
    else if (this.risk_level === 'high') priority += 30;
    else if (this.risk_level === 'medium') priority += 20;
    else if (this.risk_level === 'low') priority += 10;
    
    // Status contribution
    if (this.is_flagged) priority += 20;
    if (this.is_overdue_review) priority += 15;
    if (!this.is_verified) priority += 10;
    if (this.is_low_confidence) priority += 10;
    
    // Match activity contribution
    if (this.match_count > 10) priority += 10;
    else if (this.match_count > 5) priority += 5;
    
    return Math.min(100, priority);
  }
}