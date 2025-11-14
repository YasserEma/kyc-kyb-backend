import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BaseRepository } from '../common/repositories/base.repository';
import { IndividualIdentityDocumentEntity } from './individual-identity-document.entity';

@Injectable()
export class IndividualIdentityDocumentRepository extends BaseRepository<IndividualIdentityDocumentEntity> {
  constructor(
    @InjectRepository(IndividualIdentityDocumentEntity)
    repository: Repository<IndividualIdentityDocumentEntity>,
  ) {
    super(repository);
  }

  findByIndividualId(individualId: string): Promise<IndividualIdentityDocumentEntity[]> {
    return this.repository.find({ where: { individual_id: individualId, is_active: true } });
  }

  findActiveExpiringWithin(days: number): Promise<IndividualIdentityDocumentEntity[]> {
    const qb: SelectQueryBuilder<IndividualIdentityDocumentEntity> = this.repository
      .createQueryBuilder('doc')
      .where('doc.is_active = :active', { active: true })
      .andWhere('doc.expiry_date IS NOT NULL')
      .andWhere("doc.expiry_date <= NOW() + (:days || ' days')::interval", { days });
    return qb.getMany();
  }
}