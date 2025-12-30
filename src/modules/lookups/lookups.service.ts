import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LookupItemDto } from './dto/lookup-response.dto';

/**
 * LookupsService - Database-Only Mode
 * 
 * This service fetches lookup data ONLY from the database.
 * If no data exists (e.g., seeders haven't run), it returns empty arrays.
 * 
 * Lookup Hierarchy:
 * 1. Tenant-specific list (if subscriberId provided)
 * 2. Global system list (is_system_list = true)
 * 3. Empty array (no data found)
 */
@Injectable()
export class LookupsService implements OnModuleInit {
  // In-memory cache for performance
  private globalCache = new Map<string, LookupItemDto[]>();
  private tenantCache = new Map<string, LookupItemDto[]>();
  private cacheTimestamps = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    // Pre-warm cache for global lists on startup
    try {
      await this.warmGlobalCache();
    } catch (error) {
      const err = error as Error;
      console.warn('Failed to warm global cache, will load on demand:', err.message);
    }
  }

  /**
   * Pre-warm cache with global lists
   */
  private async warmGlobalCache(): Promise<void> {
    const globalListNames = [
      'Entity Types',
      'Nationalities',
      'Genders',
      'Organization Types',
      'Document Types',
      'Individual Relationship Types',
      'Organization Relationship Types',
      'Association Types',
    ];

    for (const listName of globalListNames) {
      const result = await this.queryListValues(listName, null);
      if (result.length > 0) {
        this.globalCache.set(listName, result);
        this.cacheTimestamps.set(`global:${listName}`, Date.now());
      }
    }
    console.log('Global lookup cache warmed');
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.globalCache.clear();
    this.tenantCache.clear();
    this.cacheTimestamps.clear();
  }

  /**
   * Clear cache for specific list
   */
  clearCacheForList(listName: string, subscriberId?: string): void {
    if (subscriberId) {
      this.tenantCache.delete(`${listName}:${subscriberId}`);
      this.cacheTimestamps.delete(`tenant:${listName}:${subscriberId}`);
    } else {
      this.globalCache.delete(listName);
      this.cacheTimestamps.delete(`global:${listName}`);
    }
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(cacheKey: string): boolean {
    const timestamp = this.cacheTimestamps.get(cacheKey);
    if (!timestamp) return false;
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  /**
   * Core lookup method - TENANT ISOLATION
   * Returns subscriber-specific lookup values only.
   * No global fallback - each tenant has their own data.
   */
  private async getLookupByName(
    listName: string,
    subscriberId?: string,
  ): Promise<LookupItemDto[]> {
    // SubscriberId is now required for tenant isolation
    if (!subscriberId) {
      console.warn(`getLookupByName called without subscriberId for ${listName}`);
      return [];
    }

    const tenantCacheKey = `${listName}:${subscriberId}`;
    const tenantTimestampKey = `tenant:${tenantCacheKey}`;

    // Check tenant cache
    if (this.tenantCache.has(tenantCacheKey) && this.isCacheValid(tenantTimestampKey)) {
      return this.tenantCache.get(tenantCacheKey)!;
    }

    // Query tenant-specific list
    const tenantResult = await this.queryListValues(listName, subscriberId);
    if (tenantResult.length > 0) {
      this.tenantCache.set(tenantCacheKey, tenantResult);
      this.cacheTimestamps.set(tenantTimestampKey, Date.now());
    }
    
    return tenantResult;
  }

  /**
   * Query list values from database
   * For global lists: queries where is_system_list = true
   * For tenant lists: queries where subscriber_id = given subscriberId
   */
  private async queryListValues(
    listName: string,
    subscriberId: string | null,
  ): Promise<LookupItemDto[]> {
    try {
      // For tenant-specific queries, use subscriber_id
      // For global queries (subscriberId === null), use is_system_list = true
      const query = subscriberId
        ? `
          SELECT lv.value, lv.normalized_value, lv.description
          FROM list_values lv
          INNER JOIN lists_management lm ON lm.id = lv.list_id
          WHERE lm.list_name = $1
            AND lm.subscriber_id = $2
            AND lm.is_active = true
            AND lv.is_active = true
          ORDER BY lv.normalized_value ASC
        `
        : `
          SELECT lv.value, lv.normalized_value, lv.description
          FROM list_values lv
          INNER JOIN lists_management lm ON lm.id = lv.list_id
          WHERE lm.list_name = $1
            AND lm.is_system_list = true
            AND lm.is_active = true
            AND lv.is_active = true
          ORDER BY lv.normalized_value ASC
        `;

      const params = subscriberId ? [listName, subscriberId] : [listName];
      const rows = await this.dataSource.query(query, params);

      return rows.map((row: any) => ({
        value: row.value,
        label: row.normalized_value || row.value,
        description: row.description || undefined,
      }));
    } catch (error) {
      const err = error as Error;
      console.error(`Error querying list "${listName}":`, err.message);
      return [];
    }
  }

  // ==================== PUBLIC LOOKUP METHODS ====================
  // All methods return ONLY database data, empty array if not found

  /**
   * Entity Types - Global List
   */
  async getEntityTypes(subscriberId?: string): Promise<LookupItemDto[]> {
    return this.getLookupByName('Entity Types', subscriberId);
  }

  /**
   * Entity Statuses - Tenant List
   */
  async getStatuses(subscriberId?: string): Promise<LookupItemDto[]> {
    return this.getLookupByName('Entity Statuses', subscriberId);
  }

  /**
   * Nationalities (ISO 3166-1 Alpha-2) - Global List
   */
  async getNationalities(subscriberId?: string): Promise<LookupItemDto[]> {
    return this.getLookupByName('Nationalities', subscriberId);
  }

  /**
   * Gender Options - Global List
   */
  async getGenders(subscriberId?: string): Promise<LookupItemDto[]> {
    return this.getLookupByName('Genders', subscriberId);
  }

  /**
   * Risk Levels - Tenant List
   */
  async getRiskLevels(subscriberId?: string): Promise<LookupItemDto[]> {
    return this.getLookupByName('Risk Levels', subscriberId);
  }

  /**
   * Screening Statuses - Tenant List
   */
  async getScreeningStatuses(subscriberId?: string): Promise<LookupItemDto[]> {
    return this.getLookupByName('Screening Statuses', subscriberId);
  }

  /**
   * Organization Types - Global List
   */
  async getOrganizationTypes(subscriberId?: string): Promise<LookupItemDto[]> {
    return this.getLookupByName('Organization Types', subscriberId);
  }

  /**
   * Document Types - Global List
   */
  async getDocumentTypes(subscriberId?: string): Promise<LookupItemDto[]> {
    return this.getLookupByName('Document Types', subscriberId);
  }

  /**
   * Individual Relationship Types - Global List
   */
  async getIndividualRelationshipTypes(subscriberId?: string): Promise<LookupItemDto[]> {
    return this.getLookupByName('Individual Relationship Types', subscriberId);
  }

  /**
   * Organization Relationship Types - Global List
   */
  async getOrganizationRelationshipTypes(subscriberId?: string): Promise<LookupItemDto[]> {
    return this.getLookupByName('Organization Relationship Types', subscriberId);
  }

  /**
   * Organization Association Types (Individual-to-Organization) - Global List
   */
  async getAssociationTypes(subscriberId?: string): Promise<LookupItemDto[]> {
    return this.getLookupByName('Association Types', subscriberId);
  }
}
