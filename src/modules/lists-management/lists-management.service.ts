import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ListRepository } from './repositories/list.repository';
import { ListValueRepository } from './repositories/list-value.repository';
import { ListEntity } from './entities/list.entity';
import { ListValueEntity } from './entities/list-value.entity';
import {
  CreateListDto,
  UpdateListDto,
  CreateListValueDto,
  UpdateListValueDto,
  ListQueryDto,
} from './dto';

/**
 * Service for managing lists with multi-tenant isolation.
 * All operations are scoped to the current subscriber.
 */
@Injectable()
export class ListsManagementService {
  constructor(
    private readonly listRepository: ListRepository,
    private readonly listValueRepository: ListValueRepository,
  ) {}

  // ============================================
  // LIST CRUD OPERATIONS
  // ============================================

  /**
   * Get all lists for the subscriber with pagination and filters
   */
  async getLists(subscriberId: string, query: ListQueryDto) {
    const filters: any = {
      subscriber_id: subscriberId,
    };

    if (query.list_type) {
      filters.list_type = query.list_type;
    }

    if (query.category) {
      filters.category = query.category;
    }

    if (query.is_active !== undefined) {
      filters.is_active = query.is_active;
    }

    if (query.search) {
      filters.list_name = query.search;
    }

    const pagination = {
      page: query.page || 1,
      limit: query.limit || 20,
      sortBy: query.sort_by || 'created_at',
      sortOrder: query.sort_order || 'DESC',
    };

    const result = await this.listRepository.findWithFilters(filters, pagination);

    // Optionally include list values
    if (query.include_values) {
      for (const list of result.data) {
        const values = await this.listValueRepository.findByListId(list.id, { is_active: true });
        (list as any).values = values.data;
      }
    }

    return result;
  }

  /**
   * Get a single list by ID with ownership verification
   */
  async getListById(subscriberId: string, listId: string, includeValues: boolean = true): Promise<ListEntity> {
    const list = await this.listRepository.findOne({
      where: {
        id: listId,
        subscriber_id: subscriberId,
      },
    });

    if (!list) {
      throw new NotFoundException(`List with ID ${listId} not found or access denied`);
    }

    // Load list values if requested
    if (includeValues) {
      const values = await this.listValueRepository.findByListId(listId, {});
      (list as any).values = values.data;
    }

    return list;
  }

  /**
   * Create a new list for the subscriber
   */
  async createList(subscriberId: string, userId: string, dto: CreateListDto): Promise<ListEntity> {
    const list = this.listRepository.create({
      subscriber_id: subscriberId,
      list_name: dto.list_name,
      list_type: dto.list_type,
      description: dto.description,
      category: dto.category,
      subcategory: dto.subcategory,
      priority: dto.priority,
      risk_level: dto.risk_level,
      is_active: dto.is_active ?? true,
      metadata: dto.metadata,
      tags: dto.tags,
      created_by: userId,
      updated_by: userId,
    });

    return await this.listRepository.save(list) as ListEntity;
  }

  /**
   * Update an existing list with ownership verification
   */
  async updateList(
    subscriberId: string,
    listId: string,
    userId: string,
    dto: UpdateListDto,
  ): Promise<ListEntity> {
    // Verify ownership
    await this.getListById(subscriberId, listId, false);

    const updateData: any = {
      ...dto,
      updated_by: userId,
    };

    await this.listRepository.update(listId, updateData);

    return this.getListById(subscriberId, listId, false);
  }

  /**
   * Soft delete a list with ownership verification
   */
  async deleteList(subscriberId: string, listId: string): Promise<{ success: boolean; message: string }> {
    // Verify ownership
    await this.getListById(subscriberId, listId, false);

    // Soft delete by setting is_active to false and marking status as archived
    await this.listRepository.update(listId, {
      is_active: false,
      status: 'archived',
    });

    return {
      success: true,
      message: `List ${listId} has been archived`,
    };
  }

  /**
   * Toggle list active status
   */
  async toggleListStatus(
    subscriberId: string,
    listId: string,
    isActive: boolean,
  ): Promise<ListEntity> {
    // Verify ownership
    await this.getListById(subscriberId, listId, false);

    await this.listRepository.update(listId, {
      is_active: isActive,
      status: isActive ? 'active' : 'inactive',
    });

    return this.getListById(subscriberId, listId, false);
  }

  // ============================================
  // LIST VALUE CRUD OPERATIONS
  // ============================================

  /**
   * Get all values for a list
   */
  async getListValues(
    subscriberId: string,
    listId: string,
    activeOnly: boolean = false,
  ) {
    // Verify list ownership
    await this.getListById(subscriberId, listId, false);

    const filters: any = {};
    if (activeOnly) {
      filters.is_active = true;
    }

    return this.listValueRepository.findByListId(listId, filters);
  }

  /**
   * Create a new value in a list
   */
  async createListValue(
    subscriberId: string,
    listId: string,
    userId: string,
    dto: CreateListValueDto,
  ): Promise<ListValueEntity> {
    // Verify list ownership
    await this.getListById(subscriberId, listId, false);

    const value = this.listValueRepository.create({
      list_id: listId,
      value: dto.value,
      value_type: dto.value_type || 'custom',
      normalized_value: dto.normalized_value,
      status: dto.status || 'active',
      category: dto.category,
      description: dto.description,
      risk_level: dto.risk_level,
      is_active: dto.is_active ?? true,
      metadata: dto.metadata,
      aliases: dto.aliases,
      tags: dto.tags,
      created_by: userId,
      updated_by: userId,
    });

    return await this.listValueRepository.save(value) as ListValueEntity;
  }

  /**
   * Update a list value
   */
  async updateListValue(
    subscriberId: string,
    listId: string,
    valueId: string,
    userId: string,
    dto: UpdateListValueDto,
  ): Promise<ListValueEntity> {
    // Verify list ownership
    await this.getListById(subscriberId, listId, false);

    // Verify value exists and belongs to the list
    const existingValue = await this.listValueRepository.findOne({
      where: { id: valueId, list_id: listId },
    });

    if (!existingValue) {
      throw new NotFoundException(`Value with ID ${valueId} not found in list ${listId}`);
    }

    const updateData: any = {
      ...dto,
      updated_by: userId,
    };

    await this.listValueRepository.update(valueId, updateData);

    const updated = await this.listValueRepository.findOne({
      where: { id: valueId },
    });

    return updated!;
  }

  /**
   * Delete a list value
   */
  async deleteListValue(
    subscriberId: string,
    listId: string,
    valueId: string,
  ): Promise<{ success: boolean; message: string }> {
    // Verify list ownership
    await this.getListById(subscriberId, listId, false);

    // Verify value exists and belongs to the list
    const existingValue = await this.listValueRepository.findOne({
      where: { id: valueId, list_id: listId },
    });

    if (!existingValue) {
      throw new NotFoundException(`Value with ID ${valueId} not found in list ${listId}`);
    }

    // Soft delete by setting is_active to false
    await this.listValueRepository.update(valueId, {
      is_active: false,
      status: 'inactive',
    });

    return {
      success: true,
      message: `Value ${valueId} has been removed from the list`,
    };
  }

  /**
   * Toggle list value active status
   */
  async toggleListValueStatus(
    subscriberId: string,
    listId: string,
    valueId: string,
    isActive: boolean,
  ): Promise<ListValueEntity> {
    // Verify list ownership
    await this.getListById(subscriberId, listId, false);

    // Verify value exists
    const existingValue = await this.listValueRepository.findOne({
      where: { id: valueId, list_id: listId },
    });

    if (!existingValue) {
      throw new NotFoundException(`Value with ID ${valueId} not found in list ${listId}`);
    }

    await this.listValueRepository.update(valueId, {
      is_active: isActive,
      status: isActive ? 'active' : 'inactive',
    });

    const updated = await this.listValueRepository.findOne({
      where: { id: valueId },
    });

    return updated!;
  }

  // ============================================
  // LOOKUP OPERATIONS (for dropdowns)
  // ============================================

  /**
   * Get lookup values for a specific list type (for frontend dropdowns)
   * Returns only active values in a simplified format
   */
  async getLookupValues(
    subscriberId: string,
    listType: string,
  ): Promise<{ value: string; label: string; metadata?: Record<string, any> }[]> {
    // Find lists of the specified type for this subscriber
    const listsResult = await this.listRepository.findWithFilters({
      subscriber_id: subscriberId,
      list_type: listType,
      is_active: true,
    });

    const lookupValues: { value: string; label: string; metadata?: Record<string, any> }[] = [];

    for (const list of listsResult.data) {
      const valuesResult = await this.listValueRepository.findByListId(list.id, {
        is_active: true,
      });

      for (const val of valuesResult.data) {
        lookupValues.push({
          value: val.normalized_value || val.value,
          label: val.value,
          metadata: val.metadata,
        });
      }
    }

    return lookupValues;
  }

  /**
   * Get lookup values by list name (more specific lookup)
   */
  async getLookupValuesByListName(
    subscriberId: string,
    listName: string,
  ): Promise<{ value: string; label: string; metadata?: Record<string, any> }[]> {
    // Find list by name for this subscriber
    const listsResult = await this.listRepository.findWithFilters({
      subscriber_id: subscriberId,
      list_name: listName,
      is_active: true,
    });

    if (listsResult.data.length === 0) {
      return [];
    }

    const list = listsResult.data[0];
    const valuesResult = await this.listValueRepository.findByListId(list.id, {
      is_active: true,
    });

    return valuesResult.data.map((val) => ({
      value: val.normalized_value || val.value,
      label: val.value,
      metadata: val.metadata,
    }));
  }

  /**
   * Batch create multiple values in a list (for seeding)
   */
  async batchCreateListValues(
    subscriberId: string,
    listId: string,
    userId: string,
    values: CreateListValueDto[],
  ): Promise<{ created: number; errors: string[] }> {
    // Verify list ownership
    await this.getListById(subscriberId, listId, false);

    let created = 0;
    const errors: string[] = [];

    for (const dto of values) {
      try {
        await this.createListValue(subscriberId, listId, userId, dto);
        created++;
      } catch (error: any) {
        errors.push(`Failed to create value "${dto.value}": ${error.message}`);
      }
    }

    return { created, errors };
  }
}
