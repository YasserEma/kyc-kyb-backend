import { Entity, Column, Index, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('document_configurations')
@Unique(['code'])
@Index(['is_active'])
export class DocumentConfigurationEntity extends BaseEntity {

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text' })
  code!: string;

  @Column({ type: 'jsonb', default: [] })
  allowed_extensions!: string[];

  @Column({ type: 'bigint', default: 0 })
  max_size_bytes!: number;

  @Column({ type: 'boolean', default: false })
  is_expiry_required!: boolean;

  @Column({ type: 'boolean', default: true })
  is_active!: boolean;
}