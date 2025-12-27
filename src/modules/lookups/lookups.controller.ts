import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LookupsService } from './lookups.service';
import { LookupResponseDto } from './dto/lookup-response.dto';

/**
 * Lookups Controller - Authenticated Tenant-Isolated Lookups
 * 
 * All endpoints require JWT authentication.
 * Subscriber ID is extracted from the JWT token for tenant isolation.
 */
@ApiTags('Lookups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lookups')
export class LookupsController {
  constructor(private readonly lookupsService: LookupsService) {}

  private buildResponse(data: any[]): LookupResponseDto {
    return {
      success: true,
      data,
      meta: {
        total: data.length,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('types')
  @ApiOperation({ summary: 'Get entity types', description: 'Returns list of entity types (INDIVIDUAL, ORGANIZATION)' })
  @ApiResponse({ status: 200, description: 'Entity types retrieved successfully', type: LookupResponseDto })
  async getTypes(@Request() req: any): Promise<LookupResponseDto> {
    const subscriberId = req.user.subscriberId;
    const data = await this.lookupsService.getEntityTypes(subscriberId);
    return this.buildResponse(data);
  }

  @Get('statuses')
  @ApiOperation({ summary: 'Get entity statuses', description: 'Returns list of entity workflow statuses' })
  @ApiResponse({ status: 200, description: 'Statuses retrieved successfully', type: LookupResponseDto })
  async getStatuses(@Request() req: any): Promise<LookupResponseDto> {
    const subscriberId = req.user.subscriberId;
    const data = await this.lookupsService.getStatuses(subscriberId);
    return this.buildResponse(data);
  }

  @Get('nationalities')
  @ApiOperation({ summary: 'Get nationalities', description: 'Returns complete list of ISO 3166-1 country codes' })
  @ApiResponse({ status: 200, description: 'Nationalities retrieved successfully', type: LookupResponseDto })
  async getNationalities(@Request() req: any): Promise<LookupResponseDto> {
    const subscriberId = req.user.subscriberId;
    const data = await this.lookupsService.getNationalities(subscriberId);
    return this.buildResponse(data);
  }

  @Get('genders')
  @ApiOperation({ summary: 'Get gender options', description: 'Returns list of gender options' })
  @ApiResponse({ status: 200, description: 'Genders retrieved successfully', type: LookupResponseDto })
  async getGenders(@Request() req: any): Promise<LookupResponseDto> {
    const subscriberId = req.user.subscriberId;
    const data = await this.lookupsService.getGenders(subscriberId);
    return this.buildResponse(data);
  }

  @Get('risk-levels')
  @ApiOperation({ summary: 'Get risk levels', description: 'Returns list of risk level classifications' })
  @ApiResponse({ status: 200, description: 'Risk levels retrieved successfully', type: LookupResponseDto })
  async getRiskLevels(@Request() req: any): Promise<LookupResponseDto> {
    const subscriberId = req.user.subscriberId;
    const data = await this.lookupsService.getRiskLevels(subscriberId);
    return this.buildResponse(data);
  }

  @Get('screening-statuses')
  @ApiOperation({ summary: 'Get screening statuses', description: 'Returns list of screening result statuses' })
  @ApiResponse({ status: 200, description: 'Screening statuses retrieved successfully', type: LookupResponseDto })
  async getScreeningStatuses(@Request() req: any): Promise<LookupResponseDto> {
    const subscriberId = req.user.subscriberId;
    const data = await this.lookupsService.getScreeningStatuses(subscriberId);
    return this.buildResponse(data);
  }

  @Get('organization-types')
  @ApiOperation({ summary: 'Get organization types', description: 'Returns list of organization/company types' })
  @ApiResponse({ status: 200, description: 'Organization types retrieved successfully', type: LookupResponseDto })
  async getOrganizationTypes(@Request() req: any): Promise<LookupResponseDto> {
    const subscriberId = req.user.subscriberId;
    const data = await this.lookupsService.getOrganizationTypes(subscriberId);
    return this.buildResponse(data);
  }

  @Get('document-types')
  @ApiOperation({ summary: 'Get document types', description: 'Returns list of supported document types' })
  @ApiResponse({ status: 200, description: 'Document types retrieved successfully', type: LookupResponseDto })
  async getDocumentTypes(@Request() req: any): Promise<LookupResponseDto> {
    const subscriberId = req.user.subscriberId;
    const data = await this.lookupsService.getDocumentTypes(subscriberId);
    return this.buildResponse(data);
  }

  @Get('individual-relationship-types')
  @ApiOperation({ summary: 'Get individual relationship types', description: 'Returns relationship types between individuals' })
  @ApiResponse({ status: 200, description: 'Relationship types retrieved successfully', type: LookupResponseDto })
  async getIndividualRelationshipTypes(@Request() req: any): Promise<LookupResponseDto> {
    const subscriberId = req.user.subscriberId;
    const data = await this.lookupsService.getIndividualRelationshipTypes(subscriberId);
    return this.buildResponse(data);
  }

  @Get('organization-relationship-types')
  @ApiOperation({ summary: 'Get organization relationship types', description: 'Returns relationship types between organizations' })
  @ApiResponse({ status: 200, description: 'Relationship types retrieved successfully', type: LookupResponseDto })
  async getOrganizationRelationshipTypes(@Request() req: any): Promise<LookupResponseDto> {
    const subscriberId = req.user.subscriberId;
    const data = await this.lookupsService.getOrganizationRelationshipTypes(subscriberId);
    return this.buildResponse(data);
  }

  @Get('association-types')
  @ApiOperation({ summary: 'Get association types', description: 'Returns individual-to-organization association types' })
  @ApiResponse({ status: 200, description: 'Association types retrieved successfully', type: LookupResponseDto })
  async getAssociationTypes(@Request() req: any): Promise<LookupResponseDto> {
    const subscriberId = req.user.subscriberId;
    const data = await this.lookupsService.getAssociationTypes(subscriberId);
    return this.buildResponse(data);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all lookups', description: 'Returns all lookup data in a single response' })
  @ApiResponse({ status: 200, description: 'All lookups retrieved successfully' })
  async getAllLookups(@Request() req: any) {
    const subscriberId = req.user.subscriberId;
    const [
      types,
      statuses,
      nationalities,
      genders,
      riskLevels,
      screeningStatuses,
      organizationTypes,
      documentTypes,
      individualRelationshipTypes,
      organizationRelationshipTypes,
      associationTypes,
    ] = await Promise.all([
      this.lookupsService.getEntityTypes(subscriberId),
      this.lookupsService.getStatuses(subscriberId),
      this.lookupsService.getNationalities(subscriberId),
      this.lookupsService.getGenders(subscriberId),
      this.lookupsService.getRiskLevels(subscriberId),
      this.lookupsService.getScreeningStatuses(subscriberId),
      this.lookupsService.getOrganizationTypes(subscriberId),
      this.lookupsService.getDocumentTypes(subscriberId),
      this.lookupsService.getIndividualRelationshipTypes(subscriberId),
      this.lookupsService.getOrganizationRelationshipTypes(subscriberId),
      this.lookupsService.getAssociationTypes(subscriberId),
    ]);

    return {
      success: true,
      data: {
        types,
        statuses,
        nationalities,
        genders,
        riskLevels,
        screeningStatuses,
        organizationTypes,
        documentTypes,
        individualRelationshipTypes,
        organizationRelationshipTypes,
        associationTypes,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('cache/clear')
  @ApiOperation({ summary: 'Clear lookup cache', description: 'Clears the in-memory lookup cache' })
  @ApiResponse({ status: 200, description: 'Cache cleared successfully' })
  clearCache() {
    this.lookupsService.clearCache();
    return {
      success: true,
      message: 'Lookup cache cleared',
      timestamp: new Date().toISOString(),
    };
  }
}
