import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder , IsNull} from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { IndividualEntity } from '../entities/individual-entity.entity';
import { PaginationOptions, PaginationResult } from '../../common/interfaces/pagination.interface';
import { QueryHelper } from '../../../utils/database/query.helper';
import { BaseFilter } from '../../common/interfaces/filter.interface';

export interface IndividualEntityFilter extends BaseFilter {
  entity_id?: string;
  nationality?: string;
  country_of_residence?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  occupation?: string;
  id_type?: 'passport' | 'national_id' | 'drivers_license' | 'other';
  is_pep?: boolean;
  has_criminal_record?: boolean;
  date_of_birth_from?: Date;
  date_of_birth_to?: Date;
  id_expiry_from?: Date;
  id_expiry_to?: Date;
  search?: string;
}

@Injectable()
export class IndividualEntityRepository extends BaseRepository<IndividualEntity> {
  constructor(
    @InjectRepository(IndividualEntity)
    private readonly individualEntityRepository: Repository<IndividualEntity>,
  ) {
    super(individualEntityRepository);
  }

  async findWithFilters(
    filters: IndividualEntityFilter = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<IndividualEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findByEntityId(entityId: string): Promise<IndividualEntity | null> {
    return this.individualEntityRepository.findOne({
      where: {
        entity_id: entityId,
        is_active: true,
        deleted_at: IsNull()
      },
      relations: ['entity', 'entity.subscriber']
    });
  }

  async findByNationality(
    nationality: string,
    filters: Omit<IndividualEntityFilter, 'nationality'> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<IndividualEntity>> {
    return this.findWithFilters({ ...filters, nationality }, pagination);
  }

  async findByCountryOfResidence(
    countryOfResidence: string,
    filters: Omit<IndividualEntityFilter, 'country_of_residence'> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<IndividualEntity>> {
    return this.findWithFilters({ ...filters, country_of_residence: countryOfResidence }, pagination);
  }

  async findByGender(
    gender: 'male' | 'female' | 'other' | 'prefer_not_to_say',
    filters: Omit<IndividualEntityFilter, 'gender'> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<IndividualEntity>> {
    return this.findWithFilters({ ...filters, gender }, pagination);
  }

  async findByOccupation(
    occupation: string,
    filters: Omit<IndividualEntityFilter, 'occupation'> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<IndividualEntity>> {
    return this.findWithFilters({ ...filters, occupation }, pagination);
  }

  async findPEPs(
    filters: Omit<IndividualEntityFilter, 'is_pep'> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<IndividualEntity>> {
    return this.findWithFilters({ ...filters, is_pep: true }, pagination);
  }

  async findWithCriminalRecord(
    filters: Omit<IndividualEntityFilter, 'has_criminal_record'> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<IndividualEntity>> {
    return this.findWithFilters({ ...filters, has_criminal_record: true }, pagination);
  }

  async findByIdType(
    idType: 'passport' | 'national_id' | 'drivers_license' | 'other',
    filters: Omit<IndividualEntityFilter, 'id_type'> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<IndividualEntity>> {
    return this.findWithFilters({ ...filters, id_type: idType }, pagination);
  }

  async findWithExpiringIds(
    daysAhead: number = 90,
    filters: Partial<IndividualEntityFilter> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<IndividualEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + daysAhead);
    
    queryBuilder.andWhere(
      'individual.id_expiry_date IS NOT NULL AND individual.id_expiry_date <= :expiryThreshold',
      { expiryThreshold }
    );
    
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findByAgeRange(
    minAge: number,
    maxAge: number,
    filters: Partial<IndividualEntityFilter> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<IndividualEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    const currentDate = new Date();
    const maxBirthDate = new Date(currentDate.getFullYear() - minAge, currentDate.getMonth(), currentDate.getDate());
    const minBirthDate = new Date(currentDate.getFullYear() - maxAge - 1, currentDate.getMonth(), currentDate.getDate());
    
    queryBuilder.andWhere(
      'individual.date_of_birth BETWEEN :minBirthDate AND :maxBirthDate',
      { minBirthDate, maxBirthDate }
    );
    
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async updatePEPStatus(entityId: string, isPep: boolean, pepDetails?: string): Promise<void> {
    const updateData: Partial<IndividualEntity> = {
      is_pep: isPep,
      pep_details: pepDetails,
      updated_at: new Date()
    };
    await this.individualEntityRepository.update({ entity_id: entityId }, updateData);
  }

  async updateCriminalRecordStatus(
    entityId: string, 
    hasCriminalRecord: boolean, 
    criminalRecordDetails?: string
  ): Promise<void> {
    const updateData: Partial<IndividualEntity> = {
      has_criminal_record: hasCriminalRecord,
      criminal_record_details: criminalRecordDetails,
      updated_at: new Date()
    };
    await this.individualEntityRepository.update({ entity_id: entityId }, updateData);
  }

  async updateIdInformation(
    entityId: string,
    idType: 'passport' | 'national_id' | 'drivers_license' | 'other',
    nationalId: string,
    idExpiryDate?: Date
  ): Promise<void> {
    const updateData: Partial<IndividualEntity> = {
      id_type: idType,
      national_id: nationalId,
      id_expiry_date: idExpiryDate,
      updated_at: new Date()
    };
    await this.individualEntityRepository.update({ entity_id: entityId }, updateData);
  }

  async getIndividualStatistics(): Promise<{
    total: number;
    by_gender: { male: number; female: number; other: number; prefer_not_to_say: number };
    by_age_group: { under_25: number; age_25_40: number; age_41_60: number; over_60: number };
    peps: number;
    with_criminal_record: number;
    by_id_type: { passport: number; national_id: number; drivers_license: number; other: number };
    expiring_ids_30_days: number;
    expiring_ids_90_days: number;
  }> {
    const baseWhere = { is_active: true, deleted_at: IsNull() };

    const [
      total,
      male,
      female,
      other,
      preferNotToSay,
      peps,
      withCriminalRecord,
      passport,
      nationalId,
      driversLicense,
      otherIdType
    ] = await Promise.all([
      this.individualEntityRepository.count({ where: baseWhere }),
      this.individualEntityRepository.count({ where: { ...baseWhere, gender: 'male' } }),
      this.individualEntityRepository.count({ where: { ...baseWhere, gender: 'female' } }),
      this.individualEntityRepository.count({ where: { ...baseWhere, gender: 'other' } }),
      this.individualEntityRepository.count({ where: { ...baseWhere, gender: 'prefer_not_to_say' } }),
      this.individualEntityRepository.count({ where: { ...baseWhere, is_pep: true } }),
      this.individualEntityRepository.count({ where: { ...baseWhere, has_criminal_record: true } }),
      this.individualEntityRepository.count({ where: { ...baseWhere, id_type: 'passport' } }),
      this.individualEntityRepository.count({ where: { ...baseWhere, id_type: 'national_id' } }),
      this.individualEntityRepository.count({ where: { ...baseWhere, id_type: 'drivers_license' } }),
      this.individualEntityRepository.count({ where: { ...baseWhere, id_type: 'other' } })
    ]);

    // Calculate age groups
    const currentDate = new Date();
    const ageGroups = await Promise.all([
      this.findByAgeRange(0, 24, {}, { page: 1, limit: 1 }).then(result => result.pagination.total_items),
      this.findByAgeRange(25, 40, {}, { page: 1, limit: 1 }).then(result => result.pagination.total_items),
      this.findByAgeRange(41, 60, {}, { page: 1, limit: 1 }).then(result => result.pagination.total_items),
      this.findByAgeRange(61, 120, {}, { page: 1, limit: 1 }).then(result => result.pagination.total_items)
    ]);

    // Calculate expiring IDs
    const [expiringIds30Days, expiringIds90Days] = await Promise.all([
      this.findWithExpiringIds(30, {}, { page: 1, limit: 1 }).then(result => result.pagination.total_items),
      this.findWithExpiringIds(90, {}, { page: 1, limit: 1 }).then(result => result.pagination.total_items)
    ]);

    return {
      total,
      by_gender: {
        male,
        female,
        other,
        prefer_not_to_say: preferNotToSay
      },
      by_age_group: {
        under_25: ageGroups[0],
        age_25_40: ageGroups[1],
        age_41_60: ageGroups[2],
        over_60: ageGroups[3]
      },
      peps,
      with_criminal_record: withCriminalRecord,
      by_id_type: {
        passport,
        national_id: nationalId,
        drivers_license: driversLicense,
        other: otherIdType
      },
      expiring_ids_30_days: expiringIds30Days,
      expiring_ids_90_days: expiringIds90Days
    };
  }

  private createFilteredQuery(filters: IndividualEntityFilter): SelectQueryBuilder<IndividualEntity> {
    const queryBuilder = this.individualEntityRepository
      .createQueryBuilder('individual')
      .leftJoinAndSelect('individual.entity', 'entity')
      .leftJoinAndSelect('entity.subscriber', 'subscriber')
      .where('individual.is_active = :isActive', { isActive: true })
      .andWhere('individual.deleted_at IS NULL');

    if (filters.entity_id) {
      queryBuilder.andWhere('individual.entity_id = :entityId', { entityId: filters.entity_id });
    }

    if (filters.nationality) {
      queryBuilder.andWhere('individual.nationality = :nationality', { nationality: filters.nationality });
    }

    if (filters.country_of_residence) {
      queryBuilder.andWhere('individual.country_of_residence = :countryOfResidence', { 
        countryOfResidence: filters.country_of_residence 
      });
    }

    if (filters.gender) {
      queryBuilder.andWhere('individual.gender = :gender', { gender: filters.gender });
    }

    if (filters.occupation) {
      queryBuilder.andWhere('individual.occupation ILIKE :occupation', { occupation: `%${filters.occupation}%` });
    }

    if (filters.id_type) {
      queryBuilder.andWhere('individual.id_type = :idType', { idType: filters.id_type });
    }

    if (filters.is_pep !== undefined) {
      queryBuilder.andWhere('individual.is_pep = :isPep', { isPep: filters.is_pep });
    }

    if (filters.has_criminal_record !== undefined) {
      queryBuilder.andWhere('individual.has_criminal_record = :hasCriminalRecord', { 
        hasCriminalRecord: filters.has_criminal_record 
      });
    }

    if (filters.date_of_birth_from) {
      queryBuilder.andWhere('individual.date_of_birth >= :dateOfBirthFrom', { 
        dateOfBirthFrom: filters.date_of_birth_from 
      });
    }

    if (filters.date_of_birth_to) {
      queryBuilder.andWhere('individual.date_of_birth <= :dateOfBirthTo', { 
        dateOfBirthTo: filters.date_of_birth_to 
      });
    }

    if (filters.id_expiry_from) {
      queryBuilder.andWhere('individual.id_expiry_date >= :idExpiryFrom', { 
        idExpiryFrom: filters.id_expiry_from 
      });
    }

    if (filters.id_expiry_to) {
      queryBuilder.andWhere('individual.id_expiry_date <= :idExpiryTo', { 
        idExpiryTo: filters.id_expiry_to 
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(individual.occupation ILIKE :search OR individual.nationality ILIKE :search OR individual.country_of_residence ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.created_at_from) {
      queryBuilder.andWhere('individual.created_at >= :createdAtFrom', { createdAtFrom: filters.created_at_from });
    }

    if (filters.created_at_to) {
      queryBuilder.andWhere('individual.created_at <= :createdAtTo', { createdAtTo: filters.created_at_to });
    }

    if (filters.updated_at_from) {
      queryBuilder.andWhere('individual.updated_at >= :updatedAtFrom', { updatedAtFrom: filters.updated_at_from });
    }

    if (filters.updated_at_to) {
      queryBuilder.andWhere('individual.updated_at <= :updatedAtTo', { updatedAtTo: filters.updated_at_to });
    }

    return queryBuilder;
  }
}