import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { SubscriberEntity } from '../../subscribers/entities/subscriber.entity';
import { SubscriberUserEntity } from '../../subscriber-users/entities/subscriber-user.entity';
import { EntityEntity } from '../../entities/entities/entity.entity';

@Entity('logs')
@Index(['subscriber_id'])
@Index(['user_id'])
@Index(['entity_id'])
@Index(['action_type'])
@Index(['severity'])
@Index(['status'])
@Index(['created_at'])
export class LogEntity extends BaseEntity {
  @Column({ type: 'uuid' })
  subscriber_id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  entity_id: string;

  @Column({ type: 'varchar', length: 100 })
  action_type: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ 
    type: 'enum', 
    enum: ['info', 'warning', 'error', 'critical'], 
    default: 'info' 
  })
  severity: 'info' | 'warning' | 'error' | 'critical';

  @Column({ 
    type: 'enum', 
    enum: ['success', 'failure', 'pending'], 
    default: 'success' 
  })
  status: 'success' | 'failure' | 'pending';

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  request_data: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  response_data: Record<string, any>;

  @Column({ type: 'inet', nullable: true })
  ip_address: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  user_agent: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  session_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  correlation_id: string;

  @Column({ type: 'integer', nullable: true })
  duration_ms: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  error_code: string;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'text', nullable: true })
  stack_trace: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  module: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  function_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  api_version: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  endpoint: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  http_method: string;

  @Column({ type: 'integer', nullable: true })
  http_status_code: number;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  // Relationships
  @ManyToOne(() => SubscriberEntity, subscriber => subscriber.logs)
  @JoinColumn({ name: 'subscriber_id' })
  subscriber: SubscriberEntity;

  @ManyToOne(() => SubscriberUserEntity, user => user.logs, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: SubscriberUserEntity;

  @ManyToOne(() => EntityEntity, entity => entity.logs, { nullable: true })
  @JoinColumn({ name: 'entity_id' })
  entity: EntityEntity;

  // Virtual properties
  get is_error(): boolean {
    return this.severity === 'error' || this.severity === 'critical' || this.status === 'failure';
  }

  get is_critical(): boolean {
    return this.severity === 'critical';
  }

  get has_error_details(): boolean {
    return !!(this.error_code || this.error_message || this.stack_trace);
  }
}