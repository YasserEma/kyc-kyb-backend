import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LookupsService } from './lookups.service';
import { LookupResponseDto } from './dto/lookup-response.dto';

@ApiTags('Lookups')
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
  @ApiOperation({ summary: 'Get entity types', description: 'Returns list of entity types (INDIVIDUAL, ORGANIZATION) for filtering and dropdowns' })
  @ApiResponse({ status: 200, description: 'Entity types retrieved successfully', type: LookupResponseDto })
  getTypes(): LookupResponseDto {
    return this.buildResponse(this.lookupsService.getEntityTypes());
  }

  @Get('statuses')
  @ApiOperation({ summary: 'Get entity statuses', description: 'Returns list of entity workflow statuses (PENDING, ACTIVE, etc.)' })
  @ApiResponse({ status: 200, description: 'Statuses retrieved successfully', type: LookupResponseDto })
  getStatuses(): LookupResponseDto {
    return this.buildResponse(this.lookupsService.getStatuses());
  }

  @Get('nationalities')
  @ApiOperation({ summary: 'Get nationalities', description: 'Returns complete list of ISO 3166-1 country codes and names' })
  @ApiResponse({ status: 200, description: 'Nationalities retrieved successfully', type: LookupResponseDto })
  getNationalities(): LookupResponseDto {
    return this.buildResponse(this.lookupsService.getNationalities());
  }

  @Get('genders')
  @ApiOperation({ summary: 'Get gender options', description: 'Returns list of gender options for individual entities' })
  @ApiResponse({ status: 200, description: 'Genders retrieved successfully', type: LookupResponseDto })
  getGenders(): LookupResponseDto {
    return this.buildResponse(this.lookupsService.getGenders());
  }

  @Get('risk-levels')
  @ApiOperation({ summary: 'Get risk levels', description: 'Returns list of risk level classifications' })
  @ApiResponse({ status: 200, description: 'Risk levels retrieved successfully', type: LookupResponseDto })
  getRiskLevels(): LookupResponseDto {
    return this.buildResponse(this.lookupsService.getRiskLevels());
  }

  @Get('screening-statuses')
  @ApiOperation({ summary: 'Get screening statuses', description: 'Returns list of screening result statuses' })
  @ApiResponse({ status: 200, description: 'Screening statuses retrieved successfully', type: LookupResponseDto })
  getScreeningStatuses(): LookupResponseDto {
    return this.buildResponse(this.lookupsService.getScreeningStatuses());
  }

  @Get('organization-types')
  @ApiOperation({ summary: 'Get organization types', description: 'Returns list of organization/company types' })
  @ApiResponse({ status: 200, description: 'Organization types retrieved successfully', type: LookupResponseDto })
  getOrganizationTypes(): LookupResponseDto {
    return this.buildResponse(this.lookupsService.getOrganizationTypes());
  }

  @Get('document-types')
  @ApiOperation({ summary: 'Get document types', description: 'Returns list of supported document types for verification' })
  @ApiResponse({ status: 200, description: 'Document types retrieved successfully', type: LookupResponseDto })
  getDocumentTypes(): LookupResponseDto {
    return this.buildResponse(this.lookupsService.getDocumentTypes());
  }

  @Get('individual-relationship-types')
  @ApiOperation({ summary: 'Get individual relationship types', description: 'Returns list of relationship types between individuals' })
  @ApiResponse({ status: 200, description: 'Relationship types retrieved successfully', type: LookupResponseDto })
  getIndividualRelationshipTypes(): LookupResponseDto {
    return this.buildResponse(this.lookupsService.getIndividualRelationshipTypes());
  }

  @Get('organization-relationship-types')
  @ApiOperation({ summary: 'Get organization relationship types', description: 'Returns list of relationship types between organizations' })
  @ApiResponse({ status: 200, description: 'Relationship types retrieved successfully', type: LookupResponseDto })
  getOrganizationRelationshipTypes(): LookupResponseDto {
    return this.buildResponse(this.lookupsService.getOrganizationRelationshipTypes());
  }

  @Get('association-types')
  @ApiOperation({ summary: 'Get association types', description: 'Returns list of individual-to-organization association types (UBO, Director, etc.)' })
  @ApiResponse({ status: 200, description: 'Association types retrieved successfully', type: LookupResponseDto })
  getAssociationTypes(): LookupResponseDto {
    return this.buildResponse(this.lookupsService.getAssociationTypes());
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all lookups', description: 'Returns all lookup data in a single response for caching' })
  @ApiResponse({ status: 200, description: 'All lookups retrieved successfully' })
  getAllLookups() {
    return {
      success: true,
      data: {
        types: this.lookupsService.getEntityTypes(),
        statuses: this.lookupsService.getStatuses(),
        nationalities: this.lookupsService.getNationalities(),
        genders: this.lookupsService.getGenders(),
        riskLevels: this.lookupsService.getRiskLevels(),
        screeningStatuses: this.lookupsService.getScreeningStatuses(),
        organizationTypes: this.lookupsService.getOrganizationTypes(),
        documentTypes: this.lookupsService.getDocumentTypes(),
        individualRelationshipTypes: this.lookupsService.getIndividualRelationshipTypes(),
        organizationRelationshipTypes: this.lookupsService.getOrganizationRelationshipTypes(),
        associationTypes: this.lookupsService.getAssociationTypes(),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  }
}
