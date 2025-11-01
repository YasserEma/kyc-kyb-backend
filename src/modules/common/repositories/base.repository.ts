import { Repository, FindOptionsWhere, FindManyOptions, SelectQueryBuilder } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export class BaseRepository<T extends BaseEntity> {
  protected repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  // Delegate common Repository methods
  find(options?: FindManyOptions<T>) {
    return this.repository.find(options);
  }

  findOne(options: FindManyOptions<T>) {
    return this.repository.findOne(options);
  }

  findAndCount(options?: FindManyOptions<T>) {
    return this.repository.findAndCount(options);
  }

  create(entityLike: Partial<T>): T {
    return this.repository.create(entityLike as any) as unknown as T;
  }

  save(entity: T | T[]) {
    return this.repository.save(entity as any);
  }

  update(criteria: any, partialEntity: any) {
    return this.repository.update(criteria, partialEntity);
  }

  delete(criteria: any) {
    return this.repository.delete(criteria);
  }

  createQueryBuilder(alias?: string): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(alias);
  }
  async findWithPagination(
    options: FindManyOptions<T>,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginationResult<T>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      ...options,
      skip,
      take: limit,
    });

    const total_pages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        current_page: page,
        total_pages,
        total_items: total,
        items_per_page: limit,
        has_next: page < total_pages,
        has_previous: page > 1,
      },
    };
  }

  async softDeleteById(id: string): Promise<void> {
    await this.repository.update(id as any, { deleted_at: new Date() } as any);
  }

  async restoreById(id: string): Promise<void> {
    await this.repository.update(id as any, { deleted_at: null } as any);
  }

  async findActive(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find({
      ...options,
      where: {
        ...options?.where,
        is_active: true,
        deleted_at: null as any,
      } as FindOptionsWhere<T>,
    });
  }
}