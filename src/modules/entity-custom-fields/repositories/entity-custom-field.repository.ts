import { Repository, SelectQueryBuilder , IsNull} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { EntityCustomFieldEntity } from '../entities/entity-custom-field.entity';
import { PaginationOptions, PaginationResult } from '../../common/interfaces/pagination.interface';
import { BaseFilter } from '../../common/interfaces/filter.interface';
import { QueryHelper } from '../../../utils/database/query.helper';

export interface EntityCustomFieldFilter extends BaseFilter {
  entity_id?: string;
  field_name?: string;
  field_type?: string;
  field_group?: string;
  is_required?: boolean;
  is_searchable?: boolean;
  is_editable?: boolean;
  is_visible?: boolean;
  is_encrypted?: boolean;
  is_pii?: boolean;
  created_by?: string;
  updated_by?: string;
  has_value?: boolean;
  field_names?: string[];
  field_types?: string[];
  field_groups?: string[];
  search?: string;
}

@Injectable()
export class EntityCustomFieldRepository extends BaseRepository<EntityCustomFieldEntity> {
  constructor(
    @InjectRepository(EntityCustomFieldEntity)
    repository: Repository<EntityCustomFieldEntity>,
  ) {
    super(repository);
  }

  async findWithFilters(
    filter: EntityCustomFieldFilter = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<EntityCustomFieldEntity>> {
    const queryBuilder = this.createQueryBuilder('field');

    this.applyFilters(queryBuilder, filter);
    QueryHelper.applySorting(queryBuilder, pagination.sortBy, pagination.sortOrder, ['created_at', 'updated_at']);

    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findByEntityId(
    entityId: string,
    filter: Partial<EntityCustomFieldFilter> = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<EntityCustomFieldEntity>> {
    const queryBuilder = this.createQueryBuilder('field')
      .where('field.entity_id = :entityId', { entityId });

    this.applyFilters(queryBuilder, filter);
    QueryHelper.applySorting(queryBuilder, pagination.sortBy, pagination.sortOrder, ['created_at', 'updated_at']);

    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findByFieldName(
    entityId: string,
    fieldName: string
  ): Promise<EntityCustomFieldEntity | null> {
    return this.findOne({
      where: {
        entity_id: entityId,
        field_name: fieldName,
        deleted_at: IsNull()
      }
    });
  }

  async findByFieldGroup(
    entityId: string,
    fieldGroup: string,
    pagination: PaginationOptions = {}
  ): Promise<PaginationResult<EntityCustomFieldEntity>> {
    const queryBuilder = this.createQueryBuilder('field')
      .where('field.entity_id = :entityId', { entityId })
      .andWhere('field.field_group = :fieldGroup', { fieldGroup })
      .andWhere('field.deleted_at IS NULL')
      .orderBy('field.display_order', 'ASC');

    return QueryHelper.buildPaginationResult(queryBuilder, pagination);
  }

  async findRequiredFields(
    entityId: string
  ): Promise<EntityCustomFieldEntity[]> {
    return this.find({
      where: {
        entity_id: entityId,
        is_required: true,
        deleted_at: IsNull()
      },
      order: {
        display_order: 'ASC'
      }
    });
  }

  async findSearchableFields(
    entityId: string
  ): Promise<EntityCustomFieldEntity[]> {
    return this.find({
      where: {
        entity_id: entityId,
        is_searchable: true,
        deleted_at: IsNull()
      },
      order: {
        display_order: 'ASC'
      }
    });
  }

  async findVisibleFields(
    entityId: string
  ): Promise<EntityCustomFieldEntity[]> {
    return this.find({
      where: {
        entity_id: entityId,
        is_visible: true,
        deleted_at: IsNull()
      },
      order: {
        display_order: 'ASC'
      }
    });
  }

  async findEditableFields(
    entityId: string
  ): Promise<EntityCustomFieldEntity[]> {
    return this.find({
      where: {
        entity_id: entityId,
        is_editable: true,
        deleted_at: IsNull()
      },
      order: {
        display_order: 'ASC'
      }
    });
  }

  async findFieldsWithValues(
    entityId: string
  ): Promise<EntityCustomFieldEntity[]> {
    const queryBuilder = this.createQueryBuilder('field')
      .where('field.entity_id = :entityId', { entityId })
      .andWhere('field.deleted_at IS NULL')
      .andWhere('(field.field_value IS NOT NULL OR field.field_value_json IS NOT NULL)')
      .orderBy('field.display_order', 'ASC');

    return queryBuilder.getMany();
  }

  async findEmptyRequiredFields(
    entityId: string
  ): Promise<EntityCustomFieldEntity[]> {
    const queryBuilder = this.createQueryBuilder('field')
      .where('field.entity_id = :entityId', { entityId })
      .andWhere('field.is_required = :isRequired', { isRequired: true })
      .andWhere('field.deleted_at IS NULL')
      .andWhere('(field.field_value IS NULL OR field.field_value = \'\')')
      .andWhere('field.field_value_json IS NULL')
      .orderBy('field.display_order', 'ASC');

    return queryBuilder.getMany();
  }

  async findPIIFields(
    entityId: string
  ): Promise<EntityCustomFieldEntity[]> {
    return this.find({
      where: {
        entity_id: entityId,
        is_pii: true,
        deleted_at: IsNull()
      },
      order: {
        display_order: 'ASC'
      }
    });
  }

  async findEncryptedFields(
    entityId: string
  ): Promise<EntityCustomFieldEntity[]> {
    return this.find({
      where: {
        entity_id: entityId,
        is_encrypted: true,
        deleted_at: IsNull()
      },
      order: {
        display_order: 'ASC'
      }
    });
  }

  async getFieldGroups(entityId: string): Promise<string[]> {
    const result = await this.createQueryBuilder('field')
      .select('DISTINCT field.field_group', 'field_group')
      .where('field.entity_id = :entityId', { entityId })
      .andWhere('field.field_group IS NOT NULL')
      .andWhere('field.deleted_at IS NULL')
      .getRawMany();

    return result.map(row => row.field_group).filter(Boolean);
  }

  async getFieldTypes(entityId: string): Promise<string[]> {
    const result = await this.createQueryBuilder('field')
      .select('DISTINCT field.field_type', 'field_type')
      .where('field.entity_id = :entityId', { entityId })
      .andWhere('field.deleted_at IS NULL')
      .getRawMany();

    return result.map(row => row.field_type);
  }

  async updateFieldValue(
    entityId: string,
    fieldName: string,
    value: any,
    updatedBy?: string
  ): Promise<boolean> {
    const field = await this.findByFieldName(entityId, fieldName);
    if (!field) {
      return false;
    }

    const updateData: Partial<EntityCustomFieldEntity> = {
      updated_by: updatedBy,
      updated_at: new Date()
    };

    if (typeof value === 'object' && value !== null) {
      updateData.field_value_json = value;
      updateData.field_value = undefined;
    } else {
      updateData.field_value = value != null ? value.toString() : undefined;
      updateData.field_value_json = null;
    }

    const result = await this.update(field.id, updateData);
    const affected = result.affected ?? 0;
    return affected > 0;
  }

  async updateDisplayOrder(
    entityId: string,
    fieldOrders: { fieldName: string; order: number }[]
  ): Promise<boolean> {
    const queryRunner = this.repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const { fieldName, order } of fieldOrders) {
        await queryRunner.manager.update(
          EntityCustomFieldEntity,
          { entity_id: entityId, field_name: fieldName },
          { display_order: order, updated_at: new Date() }
        );
      }

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async validateRequiredFields(entityId: string): Promise<{
    isValid: boolean;
    missingFields: string[];
    invalidFields: { fieldName: string; errors: string[] }[];
  }> {
    const requiredFields = await this.findRequiredFields(entityId);
    const missingFields: string[] = [];
    const invalidFields: { fieldName: string; errors: string[] }[] = [];

    for (const field of requiredFields) {
      if (field.is_empty) {
        missingFields.push(field.field_name);
      } else if (!field.is_valid) {
        invalidFields.push({
          fieldName: field.field_name,
          errors: field.validation_errors
        });
      }
    }

    return {
      isValid: missingFields.length === 0 && invalidFields.length === 0,
      missingFields,
      invalidFields
    };
  }

  async getFieldStatistics(entityId?: string): Promise<{
    total_fields: number;
    required_fields: number;
    optional_fields: number;
    fields_with_values: number;
    empty_fields: number;
    pii_fields: number;
    encrypted_fields: number;
    field_types: Record<string, number>;
    field_groups: Record<string, number>;
  }> {
    const queryBuilder = this.createQueryBuilder('field')
      .where('field.deleted_at IS NULL');

    if (entityId) {
      queryBuilder.andWhere('field.entity_id = :entityId', { entityId });
    }

    const fields = await queryBuilder.getMany();

    const stats = {
      total_fields: fields.length,
      required_fields: fields.filter(f => f.is_required).length,
      optional_fields: fields.filter(f => !f.is_required).length,
      fields_with_values: fields.filter(f => !f.is_empty).length,
      empty_fields: fields.filter(f => f.is_empty).length,
      pii_fields: fields.filter(f => f.is_pii).length,
      encrypted_fields: fields.filter(f => f.is_encrypted).length,
      field_types: {} as Record<string, number>,
      field_groups: {} as Record<string, number>
    };

    // Count by field type
    fields.forEach(field => {
      stats.field_types[field.field_type] = (stats.field_types[field.field_type] || 0) + 1;
    });

    // Count by field group
    fields.forEach(field => {
      if (field.field_group) {
        stats.field_groups[field.field_group] = (stats.field_groups[field.field_group] || 0) + 1;
      }
    });

    return stats;
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<EntityCustomFieldEntity>,
    filter: EntityCustomFieldFilter
  ): void {
    QueryHelper.applyBaseFilters(queryBuilder, filter, 'field');

    if (filter.entity_id) {
      queryBuilder.andWhere('field.entity_id = :entityId', { entityId: filter.entity_id });
    }

    if (filter.field_name) {
      queryBuilder.andWhere('field.field_name ILIKE :fieldName', { 
        fieldName: `%${filter.field_name}%` 
      });
    }

    if (filter.field_type) {
      queryBuilder.andWhere('field.field_type = :fieldType', { fieldType: filter.field_type });
    }

    if (filter.field_group) {
      queryBuilder.andWhere('field.field_group = :fieldGroup', { fieldGroup: filter.field_group });
    }

    if (filter.is_required !== undefined) {
      queryBuilder.andWhere('field.is_required = :isRequired', { isRequired: filter.is_required });
    }

    if (filter.is_searchable !== undefined) {
      queryBuilder.andWhere('field.is_searchable = :isSearchable', { isSearchable: filter.is_searchable });
    }

    if (filter.is_editable !== undefined) {
      queryBuilder.andWhere('field.is_editable = :isEditable', { isEditable: filter.is_editable });
    }

    if (filter.is_visible !== undefined) {
      queryBuilder.andWhere('field.is_visible = :isVisible', { isVisible: filter.is_visible });
    }

    if (filter.is_encrypted !== undefined) {
      queryBuilder.andWhere('field.is_encrypted = :isEncrypted', { isEncrypted: filter.is_encrypted });
    }

    if (filter.is_pii !== undefined) {
      queryBuilder.andWhere('field.is_pii = :isPii', { isPii: filter.is_pii });
    }

    if (filter.created_by) {
      queryBuilder.andWhere('field.created_by = :createdBy', { createdBy: filter.created_by });
    }

    if (filter.updated_by) {
      queryBuilder.andWhere('field.updated_by = :updatedBy', { updatedBy: filter.updated_by });
    }

    if (filter.has_value !== undefined) {
      if (filter.has_value) {
        queryBuilder.andWhere('(field.field_value IS NOT NULL OR field.field_value_json IS NOT NULL)');
      } else {
        queryBuilder.andWhere('field.field_value IS NULL AND field.field_value_json IS NULL');
      }
    }

    if (filter.field_names?.length) {
      QueryHelper.applyInClause(queryBuilder, 'field.field_name', filter.field_names, 'fieldNames');
    }

    if (filter.field_types?.length) {
      QueryHelper.applyInClause(queryBuilder, 'field.field_type', filter.field_types, 'fieldTypes');
    }

    if (filter.field_groups?.length) {
      QueryHelper.applyInClause(queryBuilder, 'field.field_group', filter.field_groups, 'fieldGroups');
    }

    if (filter.search) {
      queryBuilder.andWhere(
        '(field.field_name ILIKE :search OR field.field_label ILIKE :search OR field.field_description ILIKE :search)',
        { search: `%${filter.search}%` }
      );
    }
  }
}