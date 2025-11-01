import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder , IsNull} from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { SubscriberUserEntity } from '../entities/subscriber-user.entity';
import { PaginationOptions, PaginationResult } from '../../common/interfaces/pagination.interface';
import { UserFilter, FilterOptions } from '../../common/interfaces/filter.interface';
import { QueryHelper } from '../../../utils/database/query.helper';

export interface SubscriberUserFilter extends UserFilter {
  role?: 'admin' | 'manager' | 'analyst' | 'viewer';
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  department?: string;
  job_title?: string;
  two_factor_enabled?: boolean;
  email_verified?: boolean;
  is_locked?: boolean;
}

@Injectable()
export class SubscriberUserRepository extends BaseRepository<SubscriberUserEntity> {
  constructor(
    @InjectRepository(SubscriberUserEntity)
    private readonly subscriberUserRepository: Repository<SubscriberUserEntity>,
  ) {
    super(subscriberUserRepository);
  }

  /**
   * Find users with advanced filtering and pagination
   */
  async findWithFilters(
    filters: SubscriberUserFilter = {},
    options: FilterOptions = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<SubscriberUserEntity>> {
    const queryBuilder = this.createFilteredQuery(filters, options);
    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<SubscriberUserEntity | null> {
    if (!email) {
      return null;
    }
    return this.subscriberUserRepository.findOne({
      where: { 
        email: email.toLowerCase()
      },
    });
  }

  /**
   * Find users by subscriber ID
   */
  async findBySubscriberId(subscriberId: string): Promise<SubscriberUserEntity[]> {
    return this.subscriberUserRepository.find({
      where: { 
        subscriber_id: subscriberId,
        is_active: true,
        deleted_at: IsNull()
      },
      order: { created_at: 'DESC' }
    });
  }

  /**
   * Find users by role
   */
  async findByRole(role: 'admin' | 'manager' | 'analyst' | 'viewer'): Promise<SubscriberUserEntity[]> {
    return this.subscriberUserRepository.find({
      where: { 
        role,
        is_active: true,
        deleted_at: IsNull()
      },
      relations: ['subscriber'],
      order: { created_at: 'DESC' }
    });
  }

  /**
   * Find user by reset token
   */
  async findByResetToken(token: string): Promise<SubscriberUserEntity | null> {
    return this.subscriberUserRepository
      .createQueryBuilder('user')
      .where('user.reset_token = :token', { token })
      .andWhere('user.reset_token_expires > :now', { now: new Date() })
      .andWhere('user.is_active = :isActive', { isActive: true })
      .andWhere('user.deleted_at IS NULL')
      .getOne();
  }

  /**
   * Find user by email verification token
   */
  async findByEmailVerificationToken(token: string): Promise<SubscriberUserEntity | null> {
    return this.subscriberUserRepository.findOne({
      where: { 
        email_verification_token: token,
        email_verified_at: IsNull(),
        is_active: true,
        deleted_at: IsNull()
      }
    });
  }

  /**
   * Find user by hashed refresh token
   */
  async findByHashedRefreshToken(hashedToken: string): Promise<SubscriberUserEntity | null> {
    return this.subscriberUserRepository.findOne({
      where: { 
        hashed_refresh_token: hashedToken,
        is_active: true,
        deleted_at: IsNull()
      }
    });
  }

  /**
   * Find all users with active reset tokens
   */
  async findUsersWithActiveResetTokens(): Promise<SubscriberUserEntity[]> {
    return this.subscriberUserRepository
      .createQueryBuilder('user')
      .where('user.reset_token IS NOT NULL')
      .andWhere('user.reset_token_expires > :now', { now: new Date() })
      .andWhere('user.is_active = :isActive', { isActive: true })
      .andWhere('user.deleted_at IS NULL')
      .getMany();
  }

  /**
   * Update last login information
   */
  async updateLastLogin(id: string, ipAddress?: string): Promise<void> {
    const updateData: Partial<SubscriberUserEntity> = {
      last_login_at: new Date(),
      failed_login_attempts: 0,
      locked_until: undefined,
      updated_at: new Date()
    };

    if (ipAddress) {
      updateData.last_login_ip = ipAddress;
    }

    await this.subscriberUserRepository.update(id, updateData);
  }

  /**
   * Increment failed login attempts
   */
  async incrementFailedLoginAttempts(id: string, maxAttempts: number = 5, lockDurationMinutes: number = 30): Promise<void> {
    const user = await this.subscriberUserRepository.findOne({ where: { id } });
    if (!user) return;

    const failedAttempts = user.failed_login_attempts + 1;
    const updateData: Partial<SubscriberUserEntity> = {
      failed_login_attempts: failedAttempts,
      updated_at: new Date()
    };

    if (failedAttempts >= maxAttempts) {
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + lockDurationMinutes);
      updateData.locked_until = lockUntil;
    }

    await this.subscriberUserRepository.update(id, updateData);
  }

  /**
   * Verify email address
   */
  async verifyEmail(id: string): Promise<void> {
    await this.subscriberUserRepository.update(id, {
      email_verified_at: new Date(),
      email_verification_token: undefined,
      updated_at: new Date()
    });
  }

  /**
   * Update password
   */
  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.subscriberUserRepository.update(id, {
      password_hash: passwordHash,
      reset_token: undefined,
      reset_token_expires: undefined,
      updated_at: new Date()
    });
  }

  /**
   * Enable/disable two-factor authentication
   */
  async updateTwoFactorAuth(id: string, enabled: boolean, secret?: string, backupCodes?: string[]): Promise<void> {
    const updateData: Partial<SubscriberUserEntity> = {
      two_factor_enabled: enabled,
      updated_at: new Date()
    };

    if (enabled && secret) {
      updateData.two_factor_secret = secret;
      updateData.two_factor_backup_codes = backupCodes || [];
    } else if (!enabled) {
      updateData.two_factor_secret = undefined;
      updateData.two_factor_backup_codes = undefined;
    }

    await this.subscriberUserRepository.update(id, updateData);
  }

  /**
   * Get user statistics by subscriber
   */
  async getUserStatsBySubscriber(subscriberId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    pending: number;
    suspended: number;
    byRole: Record<string, number>;
  }> {
    const baseWhere = { 
      subscriber_id: subscriberId, 
      is_active: true, 
      deleted_at: IsNull() 
    };

    const [total, active, inactive, pending, suspended] = await Promise.all([
      this.subscriberUserRepository.count({ where: baseWhere }),
      this.subscriberUserRepository.count({ where: { ...baseWhere, status: 'active' } }),
      this.subscriberUserRepository.count({ where: { ...baseWhere, status: 'inactive' } }),
      this.subscriberUserRepository.count({ where: { ...baseWhere, status: 'pending' } }),
      this.subscriberUserRepository.count({ where: { ...baseWhere, status: 'suspended' } })
    ]);

    const roleStats = await this.subscriberUserRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .where('user.subscriber_id = :subscriberId', { subscriberId })
      .andWhere('user.is_active = :isActive', { isActive: true })
      .andWhere('user.deleted_at IS NULL')
      .groupBy('user.role')
      .getRawMany();

    const byRole = roleStats.reduce((acc, stat) => {
      acc[stat.role] = parseInt(stat.count);
      return acc;
    }, {});

    return {
      total,
      active,
      inactive,
      pending,
      suspended,
      byRole
    };
  }

  /**
   * Create filtered query builder
   */
  private createFilteredQuery(
    filters: SubscriberUserFilter,
    options: FilterOptions
  ): SelectQueryBuilder<SubscriberUserEntity> {
    const queryBuilder = this.subscriberUserRepository.createQueryBuilder('user');

    // Apply base filters
    QueryHelper.applyBaseFilters(queryBuilder, filters, 'user');
    QueryHelper.applySoftDeleteFilter(queryBuilder, 'user');

    // Apply specific filters
    if (filters.subscriber_id) {
      queryBuilder.andWhere('user.subscriber_id = :subscriberId', { 
        subscriberId: filters.subscriber_id 
      });
    }

    if (filters.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters.status) {
      queryBuilder.andWhere('user.status = :status', { status: filters.status });
    }

    if (filters.email) {
      queryBuilder.andWhere('user.email ILIKE :email', { 
        email: QueryHelper.buildLikeQuery(filters.email) 
      });
    }

    if (filters.name) {
      queryBuilder.andWhere(
        '(user.first_name ILIKE :name OR user.last_name ILIKE :name OR CONCAT(user.first_name, \' \', user.last_name) ILIKE :name)',
        { name: QueryHelper.buildLikeQuery(filters.name) }
      );
    }

    if (filters.department) {
      queryBuilder.andWhere('user.department ILIKE :department', { 
        department: QueryHelper.buildLikeQuery(filters.department) 
      });
    }

    if (filters.job_title) {
      queryBuilder.andWhere('user.job_title ILIKE :jobTitle', { 
        jobTitle: QueryHelper.buildLikeQuery(filters.job_title) 
      });
    }

    if (filters.two_factor_enabled !== undefined) {
      queryBuilder.andWhere('user.two_factor_enabled = :twoFactorEnabled', { 
        twoFactorEnabled: filters.two_factor_enabled 
      });
    }

    if (filters.email_verified !== undefined) {
      if (filters.email_verified) {
        queryBuilder.andWhere('user.email_verified_at IS NOT NULL');
      } else {
        queryBuilder.andWhere('user.email_verified_at IS NULL');
      }
    }

    if (filters.is_locked !== undefined) {
      if (filters.is_locked) {
        queryBuilder.andWhere('user.locked_until > :now', { now: new Date() });
      } else {
        queryBuilder.andWhere('(user.locked_until IS NULL OR user.locked_until <= :now)', { now: new Date() });
      }
    }

    // Apply search
    if (options.search) {
      QueryHelper.applySearch(
        queryBuilder,
        options.search,
        ['first_name', 'last_name', 'email', 'department', 'job_title'],
        'user'
      );
    }

    // Apply sorting
    QueryHelper.applySorting(
      queryBuilder,
      options,
      'user',
      ['first_name', 'last_name', 'email', 'role', 'status', 'created_at', 'updated_at', 'last_login_at']
    );

    return queryBuilder;
  }
}