import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Request } from 'express';

import { OrganizationEntityAssociationsService } from './organization-entity-associations.service';
import { CreateOrganizationAssociationDto } from './dtos/create-organization-association.dto';

@ApiTags('Organization Entity Associations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('organization-entity-associations')
export class OrganizationEntityAssociationsController {
  constructor(private readonly associationsService: OrganizationEntityAssociationsService) {}

  @Get()
  @Roles('admin', 'analyst', 'reviewer')
  @ApiOperation({ summary: 'List organization entity associations' })
  @ApiResponse({ status: 200, description: 'List of associations' })
  @ApiQuery({ name: 'organization_id', required: false, description: 'Filter by organization entity ID' })
  @ApiQuery({ name: 'individual_id', required: false, description: 'Filter by individual entity ID' })
  @ApiQuery({ name: 'relationship_type', required: false, description: 'Filter by relationship type' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'verification_status', required: false, description: 'Filter by verification status' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  async listAssociations(
    @Query('organization_id') organizationId?: string,
    @Query('individual_id') individualId?: string,
    @Query('relationship_type') relationshipType?: string,
    @Query('status') status?: string,
    @Query('verification_status') verificationStatus?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.associationsService.listAssociations({
      organizationId,
      individualId,
      relationshipType,
      status,
      verificationStatus,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  @Roles('admin', 'analyst', 'reviewer')
  @ApiOperation({ summary: 'Get association details' })
  @ApiResponse({ status: 200, description: 'Association details' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  async getAssociation(@Param('id') id: string) {
    return this.associationsService.getAssociationById(id);
  }

  @Post()
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Create organization entity association' })
  @ApiResponse({ status: 201, description: 'Association created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createAssociation(
    @Body() dto: CreateOrganizationAssociationDto,
    @Req() req: Request,
  ) {
    const payload = req.user as any;
    return this.associationsService.createAssociation(dto, payload.sub);
  }

  @Put(':id/verify')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Update verification status' })
  @ApiResponse({ status: 200, description: 'Verification status updated' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  async updateVerificationStatus(
    @Param('id') id: string,
    @Body('verification_status') verificationStatus: string,
    @Body('verification_notes') verificationNotes?: string,
    @Req() req?: Request,
  ) {
    const payload = req?.user as any;
    return this.associationsService.updateVerificationStatus(id, verificationStatus, verificationNotes, payload?.sub);
  }

  @Put(':id/next-review')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Set next review date' })
  @ApiResponse({ status: 200, description: 'Next review date set' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  async setNextReviewDate(
    @Param('id') id: string,
    @Body('next_review_date') nextReviewDate: string,
    @Req() req?: Request,
  ) {
    const payload = req?.user as any;
    return this.associationsService.setNextReviewDate(id, new Date(nextReviewDate), payload?.sub);
  }

  @Put(':id/risk-level')
  @Roles('admin', 'analyst')
  @ApiOperation({ summary: 'Update risk level' })
  @ApiResponse({ status: 200, description: 'Risk level updated' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  async updateRiskLevel(
    @Param('id') id: string,
    @Body('risk_level') riskLevel: string,
    @Body('risk_reason') riskReason?: string,
    @Req() req?: Request,
  ) {
    const payload = req?.user as any;
    return this.associationsService.updateRiskLevel(id, riskLevel, riskReason, payload?.sub);
  }

  @Get('organization/:organization_id/stats')
  @Roles('admin', 'analyst', 'reviewer')
  @ApiOperation({ summary: 'Get association statistics for organization' })
  @ApiResponse({ status: 200, description: 'Association statistics' })
  async getOrganizationStats(@Param('organization_id') organizationId: string) {
    return this.associationsService.getOrganizationStats(organizationId);
  }

  @Get('individual/:individual_id/associations')
  @Roles('admin', 'analyst', 'reviewer')
  @ApiOperation({ summary: 'Get associations for individual' })
  @ApiResponse({ status: 200, description: 'List of associations' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by status' })
  @ApiQuery({ name: 'verification_status', required: false, description: 'Filter by verification status' })
  async getIndividualAssociations(
    @Param('individual_id') individualId: string,
    @Query('status') status?: string,
    @Query('verification_status') verificationStatus?: string,
  ) {
    return this.associationsService.getIndividualAssociations(individualId, {
      status,
      verificationStatus,
    });
  }
}