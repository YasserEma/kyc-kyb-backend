import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder , IsNull} from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { SubscriberEntity } from '../entities/subscriber.entity';
import { PaginationOptions, PaginationResult } from '../../common/interfaces/pagination.interface';
import { BaseFilter, FilterOptions } from '../../common/interfaces/filter.interface';
import { QueryHelper } from '../../../utils/database/query.helper';

export interface SubscriberFilter extends BaseFilter {
  company_name?: string;
  company_code?: string;
  subscription_tier?: 'basic' | 'premium' | 'enterprise';
  status?: 'active' | 'inactive' | 'suspended' | 'trial';
  city?: string;
  state?: string;
  country?: string;
}

@Injectable()
export class SubscriberRepository extends BaseRepository<SubscriberEntity> {
  constructor(
    @InjectRepository(SubscriberEntity)
    private readonly subscriberRepository: Repository<SubscriberEntity>,
  ) {
    super(subscriberRepository);
  }

  /**
   * Find subscribers with advanced filtering and pagination
   */
  async findWithFilters(
    filters: SubscriberFilter = {},
    options: FilterOptions = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<SubscriberEntity>> {
    const queryBuilder = this.createFilteredQuery(filters, options);
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  /**
   * Find subscriber by company code
   */
  async findByCompanyCode(companyCode: string): Promise<SubscriberEntity | null> {
    return this.subscriberRepository.findOne({
      where: { 
        company_code: companyCode,
        is_active: true,
        deleted_at: IsNull()
      }
    });
  }

  /**
   * Find subscriber by username
   */
  async findByUsername(username: string): Promise<SubscriberEntity | null> {
    if (!username) {
      return null;
    }
    return this.subscriberRepository.findOne({
      where: { username }
    });
  }

  /**
   * Find subscriber by email
   */
  async findByEmail(email: string): Promise<SubscriberEntity | null> {
    if (!email) {
      return null;
    }
    return this.subscriberRepository.findOne({
      where: { email: email.toLowerCase() }
    });
  }

  /**
   * Find subscribers by subscription tier
   */
  async findBySubscriptionTier(tier: 'basic' | 'premium' | 'enterprise'): Promise<SubscriberEntity[]> {
    return this.subscriberRepository.find({
      where: { 
        subscription_tier: tier,
        is_active: true,
        deleted_at: IsNull()
      },
      order: { created_at: 'DESC' }
    });
  }

  /**
   * Find subscribers with expiring subscriptions
   */
  async findExpiringSubscriptions(daysAhead: number = 30): Promise<SubscriberEntity[]> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysAhead);

    return this.subscriberRepository
      .createQueryBuilder('subscriber')
      .where('subscriber.subscription_end_date <= :expirationDate', { expirationDate })
      .andWhere('subscriber.subscription_end_date > :now', { now: new Date() })
      .andWhere('subscriber.status = :status', { status: 'active' })
      .andWhere('subscriber.is_active = :isActive', { isActive: true })
      .andWhere('subscriber.deleted_at IS NULL')
      .orderBy('subscriber.subscription_end_date', 'ASC')
      .getMany();
  }

  /**
   * Update subscriber API rate limit
   */
  async updateApiRateLimit(id: string, rateLimit: number): Promise<void> {
    await this.subscriberRepository.update(id, { 
      api_rate_limit: rateLimit,
      updated_at: new Date()
    });
  }

  /**
   * Update last login information
   */
  async updateLastLogin(id: string, ipAddress?: string): Promise<void> {
    const updateData: Partial<SubscriberEntity> = {
      last_login_at: new Date(),
      updated_at: new Date()
    };

    if (ipAddress) {
      updateData.last_login_ip = ipAddress;
    }

    await this.subscriberRepository.update(id, updateData);
  }

  /**
   * Get subscriber statistics
   */
  async getSubscriberStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    trial: number;
    byTier: Record<string, number>;
  }> {
    const [total, active, inactive, suspended, trial] = await Promise.all([
      this.subscriberRepository.count({ where: { is_active: true, deleted_at: IsNull() } }),
      this.subscriberRepository.count({ where: { status: 'active', is_active: true, deleted_at: IsNull() } }),
      this.subscriberRepository.count({ where: { status: 'inactive', is_active: true, deleted_at: IsNull() } }),
      this.subscriberRepository.count({ where: { status: 'suspended', is_active: true, deleted_at: IsNull() } }),
      this.subscriberRepository.count({ where: { status: 'trial', is_active: true, deleted_at: IsNull() } })
    ]);

    const tierStats = await this.subscriberRepository
      .createQueryBuilder('subscriber')
      .select('subscriber.subscription_tier', 'tier')
      .addSelect('COUNT(*)', 'count')
      .where('subscriber.is_active = :isActive', { isActive: true })
      .andWhere('subscriber.deleted_at IS NULL')
      .groupBy('subscriber.subscription_tier')
      .getRawMany();

    const byTier = tierStats.reduce((acc, stat) => {
      acc[stat.tier] = parseInt(stat.count);
      return acc;
    }, {});

    return {
      total,
      active,
      inactive,
      suspended,
      trial,
      byTier
    };
  }

  /**
   * Create filtered query builder
   */
  private createFilteredQuery(
    filters: SubscriberFilter,
    options: FilterOptions
  ): SelectQueryBuilder<SubscriberEntity> {
    const queryBuilder = this.subscriberRepository.createQueryBuilder('subscriber');

    // Apply base filters
    QueryHelper.applyBaseFilters(queryBuilder, filters, 'subscriber');
    QueryHelper.applySoftDeleteFilter(queryBuilder, 'subscriber');

    // Apply specific filters
    if (filters.company_name) {
      queryBuilder.andWhere('subscriber.company_name ILIKE :companyName', { 
        companyName: QueryHelper.buildLikeQuery(filters.company_name) 
      });
    }

    if (filters.company_code) {
      queryBuilder.andWhere('subscriber.company_code = :companyCode', { 
        companyCode: filters.company_code 
      });
    }

    if (filters.subscription_tier) {
      queryBuilder.andWhere('subscriber.subscription_tier = :subscriptionTier', { 
        subscriptionTier: filters.subscription_tier 
      });
    }

    if (filters.status) {
      queryBuilder.andWhere('subscriber.status = :status', { 
        status: filters.status 
      });
    }

    if (filters.city) {
      queryBuilder.andWhere('subscriber.city ILIKE :city', { 
        city: QueryHelper.buildLikeQuery(filters.city) 
      });
    }

    if (filters.state) {
      queryBuilder.andWhere('subscriber.state ILIKE :state', { 
        state: QueryHelper.buildLikeQuery(filters.state) 
      });
    }

    if (filters.country) {
      queryBuilder.andWhere('subscriber.country ILIKE :country', { 
        country: QueryHelper.buildLikeQuery(filters.country) 
      });
    }

    // Apply search
    if (options.search) {
      QueryHelper.applySearch(
        queryBuilder,
        options.search,
        ['company_name', 'company_code', 'email', 'city', 'state', 'country'],
        'subscriber'
      );
    }

    // Apply sorting
    QueryHelper.applySorting(
      queryBuilder,
      options,
      'subscriber',
      ['company_name', 'company_code', 'subscription_tier', 'status', 'created_at', 'updated_at']
    );

    return queryBuilder;
  }
}