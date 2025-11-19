import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder , IsNull} from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { OrganizationEntity } from '../entities/organization-entity.entity';
import { PaginationOptions, PaginationResult } from '../../common/interfaces/pagination.interface';
import { QueryHelper } from '../../../utils/database/query.helper';
import { BaseFilter } from '../../common/interfaces/filter.interface';

export interface OrganizationEntityFilter extends BaseFilter {
  entity_id?: string;
  legal_name?: string;
  trade_name?: string;
  country_of_incorporation?: string;
  organization_type?: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship' | 'non_profit' | 'government' | 'other';
  legal_structure?: 'public' | 'private' | 'partnership' | 'cooperative' | 'trust' | 'foundation' | 'other';
  industry_sector?: string;
  tax_identification_number?: string;
  commercial_registration_number?: string;
  date_of_incorporation_from?: Date;
  date_of_incorporation_to?: Date;
  number_of_employees_min?: number;
  number_of_employees_max?: number;
  annual_revenue_min?: number;
  annual_revenue_max?: number;
  search?: string;
}

@Injectable()
export class OrganizationEntityRepository extends BaseRepository<OrganizationEntity> {
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly organizationEntityRepository: Repository<OrganizationEntity>,
  ) {
    super(organizationEntityRepository);
  }

  async findWithFilters(
    filters: OrganizationEntityFilter = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<OrganizationEntity>> {
    const queryBuilder = this.createFilteredQuery(filters);
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findByEntityId(entityId: string): Promise<OrganizationEntity | null> {
    return this.organizationEntityRepository.findOne({
      where: {
        entity_id: entityId,
        is_active: true,
        deleted_at: IsNull()
      },
      relations: ['entity']
    });
  }

  async findByLegalName(
    legalName: string,
    filters: Omit<OrganizationEntityFilter, 'legal_name'> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<OrganizationEntity>> {
    return this.findWithFilters({ ...filters, legal_name: legalName }, pagination);
  }

  async findByTradeName(
    tradeName: string,
    filters: Omit<OrganizationEntityFilter, 'trade_name'> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<OrganizationEntity>> {
    return this.findWithFilters({ ...filters, trade_name: tradeName }, pagination);
  }

  async findByCountryOfIncorporation(
    countryOfIncorporation: string,
    filters: Omit<OrganizationEntityFilter, 'country_of_incorporation'> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<OrganizationEntity>> {
    return this.findWithFilters({ ...filters, country_of_incorporation: countryOfIncorporation }, pagination);
  }

  async findByOrganizationType(
    organizationType: 'corporation' | 'llc' | 'partnership' | 'sole_proprietorship' | 'non_profit' | 'government' | 'other',
    filters: Omit<OrganizationEntityFilter, 'organization_type'> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<OrganizationEntity>> {
    return this.findWithFilters({ ...filters, organization_type: organizationType }, pagination);
  }

  async findByLegalStructure(
    legalStructure: 'public' | 'private' | 'partnership' | 'cooperative' | 'trust' | 'foundation' | 'other',
    filters: Omit<OrganizationEntityFilter, 'legal_structure'> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<OrganizationEntity>> {
    return this.findWithFilters({ ...filters, legal_structure: legalStructure }, pagination);
  }

  async findByIndustrySector(
    industrySector: string,
    filters: Omit<OrganizationEntityFilter, 'industry_sector'> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<OrganizationEntity>> {
    return this.findWithFilters({ ...filters, industry_sector: industrySector }, pagination);
  }

  async findByTaxId(taxId: string): Promise<OrganizationEntity | null> {
    return this.organizationEntityRepository.findOne({
      where: {
        tax_identification_number: taxId,
        is_active: true,
        deleted_at: IsNull()
      },
      relations: ['entity']
    });
  }

  async findByCommercialRegistrationNumber(registrationNumber: string): Promise<OrganizationEntity | null> {
    return this.organizationEntityRepository.findOne({
      where: {
        commercial_registration_number: registrationNumber,
        is_active: true,
        deleted_at: IsNull()
      },
      relations: ['entity']
    });
  }

  async findByEmployeeRange(
    minEmployees: number,
    maxEmployees: number,
    filters: Partial<OrganizationEntityFilter> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<OrganizationEntity>> {
    return this.findWithFilters({
      ...filters,
      number_of_employees_min: minEmployees,
      number_of_employees_max: maxEmployees
    }, pagination);
  }

  async findByRevenueRange(
    minRevenue: number,
    maxRevenue: number,
    filters: Partial<OrganizationEntityFilter> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<OrganizationEntity>> {
    return this.findWithFilters({
      ...filters,
      annual_revenue_min: minRevenue,
      annual_revenue_max: maxRevenue
    }, pagination);
  }

  async findLargeOrganizations(
    employeeThreshold: number = 1000,
    filters: Partial<OrganizationEntityFilter> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<OrganizationEntity>> {
    return this.findWithFilters({
      ...filters,
      number_of_employees_min: employeeThreshold
    }, pagination);
  }

  async findHighRevenueOrganizations(
    revenueThreshold: number = 10000000, // 10M
    filters: Partial<OrganizationEntityFilter> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<OrganizationEntity>> {
    return this.findWithFilters({
      ...filters,
      annual_revenue_min: revenueThreshold
    }, pagination);
  }

  async findPublicCompanies(
    filters: Partial<OrganizationEntityFilter> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<OrganizationEntity>> {
    return this.findWithFilters({ ...filters, legal_structure: 'public' }, pagination);
  }

  async findNonProfitOrganizations(
    filters: Partial<OrganizationEntityFilter> = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<OrganizationEntity>> {
    return this.findWithFilters({ ...filters, organization_type: 'non_profit' }, pagination);
  }

  async updateContactInformation(
    entityId: string,
    contactEmail: string,
    contactPhone: string
  ): Promise<void> {
    const updateData: Partial<OrganizationEntity> = {
      contact_email: contactEmail,
      contact_phone: contactPhone,
      updated_at: new Date()
    };
    await this.organizationEntityRepository.update({ entity_id: entityId }, updateData);
  }

  async updateBusinessInformation(
    entityId: string,
    numberOfEmployees?: number,
    annualRevenue?: number,
    industrySector?: string
  ): Promise<void> {
    const updateData: Partial<OrganizationEntity> = {
      updated_at: new Date()
    };

    if (numberOfEmployees !== undefined) {
      updateData.number_of_employees = numberOfEmployees;
    }

    if (annualRevenue !== undefined) {
      updateData.annual_revenue = annualRevenue.toString();
    }

    if (industrySector !== undefined) {
      updateData.industry_sector = industrySector;
    }

    await this.organizationEntityRepository.update({ entity_id: entityId }, updateData);
  }

  async updateAddresses(
    entityId: string,
    registeredAddress?: string,
    operatingAddress?: string
  ): Promise<void> {
    const updateData: Partial<OrganizationEntity> = {
      updated_at: new Date()
    };

    if (registeredAddress !== undefined) {
      updateData.registered_address = registeredAddress;
    }

    if (operatingAddress !== undefined) {
      updateData.operating_address = operatingAddress;
    }

    await this.organizationEntityRepository.update({ entity_id: entityId }, updateData);
  }

  async getOrganizationStatistics(): Promise<{
    total: number;
    by_type: {
      corporation: number;
      llc: number;
      partnership: number;
      sole_proprietorship: number;
      non_profit: number;
      government: number;
      other: number;
    };
    by_structure: {
      public: number;
      private: number;
      partnership: number;
      cooperative: number;
      trust: number;
      foundation: number;
      other: number;
    };
    by_size: {
      small: number; // < 50 employees
      medium: number; // 50-500 employees
      large: number; // > 500 employees
    };
    by_revenue: {
      low: number; // < 1M
      medium: number; // 1M-10M
      high: number; // > 10M
    };
    by_country: { [country: string]: number };
    by_industry: { [industry: string]: number };
  }> {
    const baseWhere = { is_active: true, deleted_at: IsNull() };

    const [
      total,
      corporation,
      llc,
      partnership,
      soleProprietorship,
      nonProfit,
      government,
      otherType,
      publicStructure,
      privateStructure,
      partnershipStructure,
      cooperative,
      trust,
      foundation,
      otherStructure
    ] = await Promise.all([
      this.organizationEntityRepository.count({ where: baseWhere }),
      this.organizationEntityRepository.count({ where: { ...baseWhere, organization_type: 'corporation' } }),
      this.organizationEntityRepository.count({ where: { ...baseWhere, organization_type: 'llc' } }),
      this.organizationEntityRepository.count({ where: { ...baseWhere, organization_type: 'partnership' } }),
      this.organizationEntityRepository.count({ where: { ...baseWhere, organization_type: 'sole_proprietorship' } }),
      this.organizationEntityRepository.count({ where: { ...baseWhere, organization_type: 'non_profit' } }),
      this.organizationEntityRepository.count({ where: { ...baseWhere, organization_type: 'government' } }),
      this.organizationEntityRepository.count({ where: { ...baseWhere, organization_type: 'other' } }),
      this.organizationEntityRepository.count({ where: { ...baseWhere, legal_structure: 'public' } }),
      this.organizationEntityRepository.count({ where: { ...baseWhere, legal_structure: 'private' } }),
      this.organizationEntityRepository.count({ where: { ...baseWhere, legal_structure: 'partnership' } }),
      this.organizationEntityRepository.count({ where: { ...baseWhere, legal_structure: 'cooperative' } }),
      this.organizationEntityRepository.count({ where: { ...baseWhere, legal_structure: 'trust' } }),
      this.organizationEntityRepository.count({ where: { ...baseWhere, legal_structure: 'foundation' } }),
      this.organizationEntityRepository.count({ where: { ...baseWhere, legal_structure: 'other' } })
    ]);

    // Calculate size categories
    const [small, medium, large] = await Promise.all([
      this.findByEmployeeRange(0, 49, {}, { page: 1, limit: 1 }).then(result => result.pagination.total_items),
      this.findByEmployeeRange(50, 500, {}, { page: 1, limit: 1 }).then(result => result.pagination.total_items),
      this.findByEmployeeRange(501, Number.MAX_SAFE_INTEGER, {}, { page: 1, limit: 1 }).then(result => result.pagination.total_items)
    ]);

    // Calculate revenue categories
    const [lowRevenue, mediumRevenue, highRevenue] = await Promise.all([
      this.findByRevenueRange(0, 999999, {}, { page: 1, limit: 1 }).then(result => result.pagination.total_items),
      this.findByRevenueRange(1000000, 9999999, {}, { page: 1, limit: 1 }).then(result => result.pagination.total_items),
      this.findByRevenueRange(10000000, Number.MAX_SAFE_INTEGER, {}, { page: 1, limit: 1 }).then(result => result.pagination.total_items)
    ]);

    // Get country and industry distributions
    const countryStats = await this.organizationEntityRepository
      .createQueryBuilder('org')
      .select('org.country_of_incorporation', 'country')
      .addSelect('COUNT(*)', 'count')
      .where('org.is_active = :isActive', { isActive: true })
      .andWhere('org.deleted_at IS NULL')
      .groupBy('org.country_of_incorporation')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const industryStats = await this.organizationEntityRepository
      .createQueryBuilder('org')
      .select('org.industry_sector', 'industry')
      .addSelect('COUNT(*)', 'count')
      .where('org.is_active = :isActive', { isActive: true })
      .andWhere('org.deleted_at IS NULL')
      .andWhere('org.industry_sector IS NOT NULL')
      .groupBy('org.industry_sector')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const byCountry = countryStats.reduce((acc, item) => {
      acc[item.country || 'Unknown'] = parseInt(item.count);
      return acc;
    }, {});

    const byIndustry = industryStats.reduce((acc, item) => {
      acc[item.industry || 'Unknown'] = parseInt(item.count);
      return acc;
    }, {});

    return {
      total,
      by_type: {
        corporation,
        llc,
        partnership,
        sole_proprietorship: soleProprietorship,
        non_profit: nonProfit,
        government,
        other: otherType
      },
      by_structure: {
        public: publicStructure,
        private: privateStructure,
        partnership: partnershipStructure,
        cooperative,
        trust,
        foundation,
        other: otherStructure
      },
      by_size: {
        small,
        medium,
        large
      },
      by_revenue: {
        low: lowRevenue,
        medium: mediumRevenue,
        high: highRevenue
      },
      by_country: byCountry,
      by_industry: byIndustry
    };
  }

  private createFilteredQuery(filters: OrganizationEntityFilter): SelectQueryBuilder<OrganizationEntity> {
    const queryBuilder = this.organizationEntityRepository
      .createQueryBuilder('organization')
      .leftJoinAndSelect('organization.entity', 'entity')
      .leftJoinAndSelect('entity.subscriber', 'subscriber')
      .where('organization.is_active = :isActive', { isActive: true })
      .andWhere('organization.deleted_at IS NULL');

    if (filters.entity_id) {
      queryBuilder.andWhere('organization.entity_id = :entityId', { entityId: filters.entity_id });
    }

    if (filters.legal_name) {
      queryBuilder.andWhere('organization.legal_name ILIKE :legalName', { legalName: `%${filters.legal_name}%` });
    }

    if (filters.trade_name) {
      queryBuilder.andWhere('organization.trade_name ILIKE :tradeName', { tradeName: `%${filters.trade_name}%` });
    }

    if (filters.country_of_incorporation) {
      queryBuilder.andWhere('organization.country_of_incorporation = :countryOfIncorporation', { 
        countryOfIncorporation: filters.country_of_incorporation 
      });
    }

    if (filters.organization_type) {
      queryBuilder.andWhere('organization.organization_type = :organizationType', { 
        organizationType: filters.organization_type 
      });
    }

    if (filters.legal_structure) {
      queryBuilder.andWhere('organization.legal_structure = :legalStructure', { 
        legalStructure: filters.legal_structure 
      });
    }

    if (filters.industry_sector) {
      queryBuilder.andWhere('organization.industry_sector ILIKE :industrySector', { 
        industrySector: `%${filters.industry_sector}%` 
      });
    }

    if (filters.tax_identification_number) {
      queryBuilder.andWhere('organization.tax_identification_number = :taxId', { 
        taxId: filters.tax_identification_number 
      });
    }

    if (filters.commercial_registration_number) {
      queryBuilder.andWhere('organization.commercial_registration_number = :regNumber', { 
        regNumber: filters.commercial_registration_number 
      });
    }

    if (filters.date_of_incorporation_from) {
      queryBuilder.andWhere('organization.date_of_incorporation >= :dateFrom', { 
        dateFrom: filters.date_of_incorporation_from 
      });
    }

    if (filters.date_of_incorporation_to) {
      queryBuilder.andWhere('organization.date_of_incorporation <= :dateTo', { 
        dateTo: filters.date_of_incorporation_to 
      });
    }

    if (filters.number_of_employees_min !== undefined) {
      queryBuilder.andWhere('organization.number_of_employees >= :employeesMin', { 
        employeesMin: filters.number_of_employees_min 
      });
    }

    if (filters.number_of_employees_max !== undefined) {
      queryBuilder.andWhere('organization.number_of_employees <= :employeesMax', { 
        employeesMax: filters.number_of_employees_max 
      });
    }

    if (filters.annual_revenue_min !== undefined) {
      queryBuilder.andWhere('organization.annual_revenue >= :revenueMin', { 
        revenueMin: filters.annual_revenue_min 
      });
    }

    if (filters.annual_revenue_max !== undefined) {
      queryBuilder.andWhere('organization.annual_revenue <= :revenueMax', { 
        revenueMax: filters.annual_revenue_max 
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(organization.legal_name ILIKE :search OR organization.trade_name ILIKE :search OR organization.industry_sector ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.created_at_from) {
      queryBuilder.andWhere('organization.created_at >= :createdAtFrom', { createdAtFrom: filters.created_at_from });
    }

    if (filters.created_at_to) {
      queryBuilder.andWhere('organization.created_at <= :createdAtTo', { createdAtTo: filters.created_at_to });
    }

    if (filters.updated_at_from) {
      queryBuilder.andWhere('organization.updated_at >= :updatedAtFrom', { updatedAtFrom: filters.updated_at_from });
    }

    if (filters.updated_at_to) {
      queryBuilder.andWhere('organization.updated_at <= :updatedAtTo', { updatedAtTo: filters.updated_at_to });
    }

    return queryBuilder;
  }
}