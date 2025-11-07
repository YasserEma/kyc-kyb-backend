import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { SubscriberUserRepository } from './repositories/subscriber-user.repository';
import { LogRepository } from '../logs/repositories/log.repository';
import { ScreeningAnalysisRepository } from '../screening-analysis/repositories/screening-analysis.repository';
import { RiskAnalysisRepository } from '../risk-analysis/repositories/risk-analysis.repository';
import { EmailService } from '../auth/email/email.service';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ExportUsersDto } from './dto/export-users.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';
import { LogActionType } from '../../utils/constants/enums';

@Injectable()
export class SubscriberUsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly subscriberUserRepository: SubscriberUserRepository,
    private readonly logRepository: LogRepository,
    private readonly screeningAnalysisRepository: ScreeningAnalysisRepository,
    private readonly riskAnalysisRepository: RiskAnalysisRepository,
    private readonly emailService: EmailService,
  ) {}

  async listUsers(subscriberId: string, query: ListUsersQueryDto) {
    const filters = {
      subscriber_id: subscriberId,
      email: query.email,
      name: query.name,
      role: query.role,
      status: query.status,
      department: query.department,
      job_title: query.job_title,
      two_factor_enabled: query.two_factor_enabled,
      email_verified: query.email_verified,
      is_locked: query.is_locked,
    } as any;

    const options = { search: query.search } as any;
    const pagination = { page: query.page ?? 1, limit: query.limit ?? 20 };

    return this.subscriberUserRepository.findWithFilters(filters, options, pagination);
  }

  async getUserDetails(userId: string, subscriberId: string) {
    const user = await this.subscriberUserRepository.findOne({
      where: { id: userId, subscriber_id: subscriberId } as any,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Activity summary counts
    const [totalLogs, screeningsConducted, risksAssessed, reviewsCompleted] = await Promise.all([
      this.logRepository
        .createQueryBuilder('log')
        .where('log.user_id = :userId', { userId })
        .andWhere('log.subscriber_id = :subscriberId', { subscriberId })
        .getCount(),
      this.screeningAnalysisRepository
        .createQueryBuilder('sa')
        .where('sa.created_by = :userId', { userId })
        .getCount(),
      this.riskAnalysisRepository
        .createQueryBuilder('ra')
        .where('ra.created_by = :userId', { userId })
        .getCount(),
      this.logRepository
        .createQueryBuilder('log')
        .where('log.user_id = :userId', { userId })
        .andWhere('log.subscriber_id = :subscriberId', { subscriberId })
        .andWhere('log.action_type IN (:...actions)', { actions: [LogActionType.APPROVE, LogActionType.REJECT] })
        .getCount(),
    ]);

    return {
      user,
      activity_summary: {
        total_logs: totalLogs,
        screenings_conducted: screeningsConducted,
        risk_assessments_performed: risksAssessed,
        reviews_completed: reviewsCompleted,
      },
    };
  }

  async createUser(subscriberId: string, adminUserId: string, dto: CreateUserDto) {
    const normalizedEmail = dto.email.toLowerCase();
    const existing = await this.subscriberUserRepository.findOne({
      where: { email: normalizedEmail, subscriber_id: subscriberId } as any,
    });
    if (existing) {
      throw new BadRequestException('Email already exists for this subscriber');
    }

    const tempPassword = Math.random().toString(36).slice(-10);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const newUser = await this.subscriberUserRepository.create({
      subscriber_id: subscriberId,
      first_name: dto.first_name,
      last_name: dto.last_name,
      email: normalizedEmail,
      password_hash: passwordHash,
      role: dto.role,
      status: dto.status ?? 'pending',
      department: dto.department,
      job_title: dto.job_title,
      is_active: true,
    } as any);

    const saved = await this.subscriberUserRepository.save(newUser);

    if (dto.send_invitation_email) {
      await this.emailService.sendNewUserInvitation(saved.email, saved.full_name, tempPassword);
    }

    return saved;
  }

  async updateUser(subscriberId: string, userId: string, dto: UpdateUserDto) {
    const user = await this.subscriberUserRepository.findOne({ where: { id: userId, subscriber_id: subscriberId } as any });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const exists = await this.subscriberUserRepository.findOne({ where: { email: dto.email.toLowerCase(), subscriber_id: subscriberId } as any });
      if (exists) {
        throw new BadRequestException('Email already exists for this subscriber');
      }
    }

    Object.assign(user, {
      first_name: dto.first_name ?? user.first_name,
      last_name: dto.last_name ?? user.last_name,
      email: dto.email ? dto.email.toLowerCase() : user.email,
      role: dto.role ?? user.role,
      status: dto.status ?? user.status,
      department: dto.department ?? user.department,
      job_title: dto.job_title ?? user.job_title,
    });

    await this.subscriberUserRepository.save(user);
    return user;
  }

  async changeUserPassword(subscriberId: string, userId: string, requester: { userId: string; role: string }, dto: ChangePasswordDto) {
    const user = await this.subscriberUserRepository.findOne({ where: { id: userId, subscriber_id: subscriberId } as any });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isSelf = requester.userId === userId;
    const isAdmin = requester.role === 'admin';

    if (!isAdmin && !isSelf) {
      throw new ForbiddenException('You are not allowed to change this password');
    }

    if (isSelf) {
      if (!dto.current_password) {
        throw new BadRequestException('Current password is required');
      }
      const matches = await bcrypt.compare(dto.current_password, user.password_hash);
      if (!matches) {
        throw new BadRequestException('Current password is incorrect');
      }
    }

    const newHash = await bcrypt.hash(dto.new_password, 12);
    await this.subscriberUserRepository.updatePassword(user.id, newHash);
    await this.subscriberUserRepository.update(user.id, { hashed_refresh_token: undefined } as any);

    if (isAdmin && dto.send_invitation_email) {
      await this.emailService.sendAdminPasswordChange(user.email, user.full_name, dto.new_password);
    }

    return { success: true };
  }
  
  async setUserStatus(userId: string, dto: UpdateStatusDto, subscriberId: string, authenticatedAdminId: string) {
    if (userId === authenticatedAdminId) {
      throw new BadRequestException('Cannot change status of your own account');
    }

    const user = await this.subscriberUserRepository.findOne({ where: { id: userId, subscriber_id: subscriberId } as any });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.subscriberUserRepository.update(userId, { status: dto.status, updated_at: new Date() } as any);
    const updated = await this.subscriberUserRepository.findOne({ where: { id: userId, subscriber_id: subscriberId } as any });
    return updated;
  }

  async deleteUser(userId: string, subscriberId: string, authenticatedAdminId: string) {
    if (userId === authenticatedAdminId) {
      throw new BadRequestException('Cannot delete your own account');
    }

    const user = await this.subscriberUserRepository.findOne({ where: { id: userId, subscriber_id: subscriberId } as any });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === 'admin') {
      const adminCount = await this.subscriberUserRepository
        .createQueryBuilder('user')
        .where('user.subscriber_id = :subscriberId', { subscriberId })
        .andWhere('user.role = :role', { role: 'admin' })
        .andWhere('user.status = :status', { status: 'active' })
        .andWhere('user.is_active = :isActive', { isActive: true })
        .andWhere('user.deleted_at IS NULL')
        .getCount();
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot delete the last active admin');
      }
    }

    await this.subscriberUserRepository.softDeleteById(userId);
    await this.subscriberUserRepository.update(userId, { status: 'inactive', is_active: false, updated_at: new Date() } as any);

    return { success: true };
  }

  async exportUsers(dto: ExportUsersDto, subscriberId: string): Promise<string> {
    const filters: any = {
      subscriber_id: subscriberId,
      email: dto.email,
      name: dto.name,
      role: dto.role,
      status: dto.status,
      department: dto.department,
      job_title: dto.job_title,
      two_factor_enabled: dto.two_factor_enabled,
      email_verified: dto.email_verified,
      is_locked: dto.is_locked,
    };

    const options: any = {};
    const limit = 100;
    let page = 1;
    let all: any[] = [];

    while (true) {
      const result = await this.subscriberUserRepository.findWithFilters(filters, options, { page, limit });
      all = all.concat(result.data);
      if (!result.pagination.has_next) break;
      page += 1;
    }

    const header = ['id','subscriber_id','first_name','last_name','email','role','status','department','job_title','is_active','created_at'];
    const rows = [header.join(',')].concat(
      all.map(u => [
        u.id,
        u.subscriber_id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.status,
        u.department ?? '',
        u.job_title ?? '',
        String((u as any).is_active ?? ''),
        (u.created_at ? new Date(u.created_at).toISOString() : ''),
      ].map(v => typeof v === 'string' ? `"${String(v).replace(/"/g, '""')}"` : String(v)).join(','))
    );

    return rows.join('\n');
  }

  async getUserPermissions(userId: string, subscriberId: string, requester: { userId: string; role: string }) {
    const user = await this.subscriberUserRepository.findOne({ where: { id: userId, subscriber_id: subscriberId } as any });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isSelf = requester.userId === userId;
    const isAdmin = requester.role === 'admin';
    if (!isSelf && !isAdmin) {
      throw new ForbiddenException('You are not allowed to view these permissions');
    }

    const permsObj = user.permissions || {};
    const permissions = Object.keys(permsObj).filter(k => permsObj[k]);
    return {
      user_id: user.id,
      role: user.role,
      permissions,
    };
  }

  async updateUserPermissions(userId: string, dto: UpdatePermissionsDto, subscriberId: string) {
    const user = await this.subscriberUserRepository.findOne({ where: { id: userId, subscriber_id: subscriberId } as any });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const current = user.permissions || {};
    const currentSet = new Set<string>(Object.keys(current).filter(k => current[k]));
    const incoming = new Set<string>(dto.permissions || []);

    let newSet: Set<string> = currentSet;
    switch (dto.mode) {
      case 'REPLACE':
        newSet = new Set<string>(incoming);
        break;
      case 'ADD':
        newSet = new Set<string>([...currentSet, ...incoming]);
        break;
      case 'REMOVE':
        newSet = new Set<string>([...currentSet].filter(p => !incoming.has(p)));
        break;
      default:
        newSet = currentSet;
    }

    const newPermissions: Record<string, boolean> = {};
    for (const p of newSet) newPermissions[p] = true;

    await this.subscriberUserRepository.update(user.id, { permissions: newPermissions, updated_at: new Date() } as any);
    const updated = await this.subscriberUserRepository.findOne({ where: { id: userId, subscriber_id: subscriberId } as any });
    return updated;
  }
}