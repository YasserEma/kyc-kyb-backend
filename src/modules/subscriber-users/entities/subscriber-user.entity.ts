import { Entity, Column, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { SubscriberEntity } from '../../subscribers/entities/subscriber.entity';
import { LogEntity } from '../../logs/entities/log.entity';

@Entity('subscriber_users')
@Index(['subscriber_id'])
@Index(['email'])
@Index(['role'])
@Index(['status'])
export class SubscriberUserEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  subscriber_id: string;

  @Column({ type: 'varchar', length: 100 })
  first_name: string;

  @Column({ type: 'varchar', length: 100 })
  last_name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ 
    type: 'enum', 
    enum: ['admin', 'manager', 'analyst', 'viewer'], 
    default: 'viewer' 
  })
  role: 'admin' | 'manager' | 'analyst' | 'viewer';

  @Column({ 
    type: 'enum', 
    enum: ['active', 'inactive', 'pending', 'suspended'], 
    default: 'pending' 
  })
  status: 'active' | 'inactive' | 'pending' | 'suspended';

  @Column({ type: 'jsonb', nullable: true })
  permissions: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  @Column({ type: 'inet', nullable: true })
  last_login_ip: string;

  @Column({ type: 'integer', default: 0 })
  failed_login_attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  locked_until: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reset_token: string;

  @Column({ type: 'timestamp', nullable: true })
  reset_token_expires: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hashed_refresh_token: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  google_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email_verification_token: string;

  @Column({ type: 'timestamp', nullable: true })
  email_verified_at: Date;

  @Column({ type: 'boolean', default: false })
  two_factor_enabled: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  two_factor_secret: string;

  @Column({ type: 'jsonb', nullable: true })
  two_factor_backup_codes: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  job_title: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relationships
  @ManyToOne(() => SubscriberEntity, subscriber => subscriber.users)
  @JoinColumn({ name: 'subscriber_id' })
  subscriber: SubscriberEntity;

  @OneToMany(() => LogEntity, log => log.user)
  logs: LogEntity[];

  // Virtual properties
  get full_name(): string {
    return `${this.first_name} ${this.last_name}`.trim();
  }

  get is_locked(): boolean {
    return this.locked_until && this.locked_until > new Date();
  }

  get is_email_verified(): boolean {
    return !!this.email_verified_at;
  }
}