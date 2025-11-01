import { Entity, Column, OneToMany, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { SubscriberUserEntity } from '../../subscriber-users/entities/subscriber-user.entity';
import { EntityEntity } from '../../entities/entities/entity.entity';
import { LogEntity } from '../../logs/entities/log.entity';
import { DocumentEntity } from '../../documents/entities/document.entity';

@Entity('subscribers')
@Index(['username'])
@Index(['email'])
@Index(['type'])
export class SubscriberEntity extends BaseEntity {
  @Column({ type: 'text', unique: true })
  username: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ type: 'text' })
  type: string;

  @Column({ type: 'text', default: 'active' })
  status: string;

  @Column({ type: 'text', nullable: true })
  company_name: string;

  @Column({ type: 'text', nullable: true })
  company_code: string;

  @Column({ type: 'text', nullable: true })
  contact_person_name: string;

  @Column({ type: 'text', nullable: true })
  contact_person_phone: string;

  @Column({ type: 'text', nullable: true })
  subscription_tier: string;

  @Column({ type: 'date', nullable: true })
  subscription_valid_from: Date;

  @Column({ type: 'date', nullable: true })
  subscription_valid_until: Date;

  @Column({ type: 'text', nullable: true })
  jurisdiction: string;

  @Column({ type: 'integer', nullable: true })
  api_rate_limit: number;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at: Date;

  @Column({ type: 'text', nullable: true })
  last_login_ip: string;

  // Relationships
  @OneToMany(() => SubscriberUserEntity, user => user.subscriber)
  users: SubscriberUserEntity[];

  @OneToMany(() => EntityEntity, entity => entity.subscriber)
  entities: EntityEntity[];

  @OneToMany(() => LogEntity, log => log.subscriber)
  logs: LogEntity[];

  @OneToMany(() => DocumentEntity, document => document.subscriber)
  documents: DocumentEntity[];
}