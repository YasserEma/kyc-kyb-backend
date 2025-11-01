import { SelectQueryBuilder, Repository, MoreThanOrEqual, Not, IsNull, ObjectLiteral } from 'typeorm';
import { PaginationOptions, PaginationResult, PaginationMeta } from '../../modules/common/interfaces/pagination.interface';
import { BaseFilter, FilterOptions } from '../../modules/common/interfaces/filter.interface';
import { DATABASE_CONSTANTS } from '../constants/database.constants';

export class QueryHelper {
  /**
   * Applies pagination to a query builder
   */
  static applyPagination<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    options: PaginationOptions
  ): SelectQueryBuilder<T>;
  static applyPagination<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    options: PaginationOptions
  ): Promise<PaginationResult<T>>;
  static applyPagination<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    options: PaginationOptions
  ): SelectQueryBuilder<T> | Promise<PaginationResult<T>> {
    const page = Math.max(options.page || DATABASE_CONSTANTS.DEFAULT_PAGE, 1);
    const limit = Math.min(
      Math.max(options.limit || DATABASE_CONSTANTS.DEFAULT_PAGE_SIZE, DATABASE_CONSTANTS.MIN_PAGE_SIZE),
      DATABASE_CONSTANTS.MAX_PAGE_SIZE
    );
    
    const offset = (page - 1) * limit;
    
    return queryBuilder.skip(offset).take(limit);
  }

  /**
   * Applies pagination and returns PaginationResult
   */
  static async applyPaginationWithResult<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    options: PaginationOptions
  ): Promise<PaginationResult<T>> {
    return this.buildPaginationResult(queryBuilder, options);
  }

  /**
   * Builds pagination result from query builder
   */
  static async buildPaginationResult<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    options: PaginationOptions
  ): Promise<PaginationResult<T>> {
    const page = Math.max(options.page || DATABASE_CONSTANTS.DEFAULT_PAGE, 1);
    const limit = Math.min(
      Math.max(options.limit || DATABASE_CONSTANTS.DEFAULT_PAGE_SIZE, DATABASE_CONSTANTS.MIN_PAGE_SIZE),
      DATABASE_CONSTANTS.MAX_PAGE_SIZE
    );

    // Clone query builder for count
    const countQueryBuilder = queryBuilder.clone();
    
    // Apply pagination to original query
    const paginatedQuery = this.applyPagination(queryBuilder, { page, limit });
    
    // Execute both queries
    const [data, totalItems] = await Promise.all([
      paginatedQuery.getMany(),
      countQueryBuilder.getCount()
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    
    const pagination: PaginationMeta = {
      current_page: page,
      total_pages: totalPages,
      total_items: totalItems,
      items_per_page: limit,
      has_next: page < totalPages,
      has_previous: page > 1
    };

    return {
      data,
      pagination
    };
  }

  /**
   * Applies base filters (common to all entities)
   */
  static applyBaseFilters<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    filters: BaseFilter,
    alias: string = queryBuilder.alias
  ): SelectQueryBuilder<T> {
    if (filters.is_active !== undefined) {
      queryBuilder.andWhere(`${alias}.is_active = :is_active`, { is_active: filters.is_active });
    }

    if (filters.created_at_from) {
      queryBuilder.andWhere(`${alias}.created_at >= :created_at_from`, { created_at_from: filters.created_at_from });
    }

    if (filters.created_at_to) {
      queryBuilder.andWhere(`${alias}.created_at <= :created_at_to`, { created_at_to: filters.created_at_to });
    }

    if (filters.updated_at_from) {
      queryBuilder.andWhere(`${alias}.updated_at >= :updated_at_from`, { updated_at_from: filters.updated_at_from });
    }

    if (filters.updated_at_to) {
      queryBuilder.andWhere(`${alias}.updated_at <= :updated_at_to`, { updated_at_to: filters.updated_at_to });
    }

    return queryBuilder;
  }

  /**
   * Applies sorting to query builder
   */
  static applySorting<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    options: FilterOptions,
    alias?: string,
    allowedSortFields?: string[]
  ): SelectQueryBuilder<T>;
  static applySorting<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    sortBy: string | undefined,
    sortOrder: 'ASC' | 'DESC' | undefined,
    allowedSortFields: string[]
  ): SelectQueryBuilder<T>;
  static applySorting<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    optionsOrSortBy: FilterOptions | string | undefined,
    aliasOrSortOrder?: string | 'ASC' | 'DESC',
    allowedSortFieldsOrAlias?: string[] | string,
    allowedSortFields?: string[]
  ): SelectQueryBuilder<T> {
    const alias = typeof aliasOrSortOrder === 'string' && aliasOrSortOrder !== 'ASC' && aliasOrSortOrder !== 'DESC' 
      ? aliasOrSortOrder 
      : queryBuilder.alias;
    
    let sortBy: string | undefined;
    let sortOrder: 'ASC' | 'DESC' | undefined;
    let allowedFields: string[];

    // Handle FilterOptions format
    if (typeof optionsOrSortBy === 'object' && optionsOrSortBy !== null) {
      sortBy = optionsOrSortBy.sort_by;
      sortOrder = optionsOrSortBy.sort_order;
      allowedFields = Array.isArray(allowedSortFieldsOrAlias) ? allowedSortFieldsOrAlias : ['created_at', 'updated_at'];
    } 
    // Handle individual parameters format
    else {
      sortBy = optionsOrSortBy;
      sortOrder = aliasOrSortOrder as 'ASC' | 'DESC' | undefined;
      allowedFields = Array.isArray(allowedSortFieldsOrAlias) ? allowedSortFieldsOrAlias : ['created_at', 'updated_at'];
    }

    if (sortBy && allowedFields.includes(sortBy)) {
      const order = sortOrder === 'DESC' ? 'DESC' : 'ASC';
      queryBuilder.orderBy(`${alias}.${sortBy}`, order);
    } else {
      // Default sorting
      queryBuilder.orderBy(`${alias}.created_at`, 'DESC');
    }

    return queryBuilder;
  }

  /**
   * Applies search to specified fields
   */
  static applySearch<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    searchTerm: string,
    searchFields: string[],
    alias: string = queryBuilder.alias
  ): SelectQueryBuilder<T> {
    if (!searchTerm || !searchFields.length) {
      return queryBuilder;
    }

    const searchConditions = searchFields
      .map(field => `${alias}.${field} ILIKE :searchTerm`)
      .join(' OR ');

    queryBuilder.andWhere(`(${searchConditions})`, { 
      searchTerm: `%${searchTerm}%` 
    });

    return queryBuilder;
  }

  /**
   * Builds a safe LIKE query with proper escaping
   */
  static buildLikeQuery(value: string, position: 'start' | 'end' | 'both' = 'both'): string {
    // Escape special characters
    const escaped = value.replace(/[%_\\]/g, '\\$&');
    
    switch (position) {
      case 'start':
        return `${escaped}%`;
      case 'end':
        return `%${escaped}`;
      case 'both':
      default:
        return `%${escaped}%`;
    }
  }

  /**
   * Applies soft delete filter (excludes deleted records)
   */
  static applySoftDeleteFilter<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    alias: string = queryBuilder.alias
  ): SelectQueryBuilder<T> {
    return queryBuilder.andWhere(`${alias}.deleted_at IS NULL`);
  }

  /**
   * Builds IN clause with proper parameter handling for large arrays
   */
  static applyInClause<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    field: string,
    values: any[],
    alias: string = queryBuilder.alias,
    parameterName: string = 'inValues'
  ): SelectQueryBuilder<T> {
    if (!values || values.length === 0) {
      return queryBuilder;
    }

    // For large arrays, split into chunks to avoid parameter limits
    const chunkSize = 1000;
    if (values.length <= chunkSize) {
      queryBuilder.andWhere(`${alias}.${field} IN (:...${parameterName})`, { [parameterName]: values });
    } else {
      const chunks = [];
      for (let i = 0; i < values.length; i += chunkSize) {
        chunks.push(values.slice(i, i + chunkSize));
      }

      const conditions = chunks.map((chunk, index) => {
        const chunkParamName = `${parameterName}_${index}`;
        queryBuilder.setParameter(chunkParamName, chunk);
        return `${alias}.${field} IN (:...${chunkParamName})`;
      });

      queryBuilder.andWhere(`(${conditions.join(' OR ')})`);
    }

    return queryBuilder;
  }

  /**
   * Create a greater than or equal condition for a field
   */
  static createGreaterThanOrEqualCondition(value: any): any {
    return MoreThanOrEqual(value);
  }

  /**
   * Create a not null condition for a field
   */
  static createNotNullCondition(): any {
    return Not(IsNull());
  }
}