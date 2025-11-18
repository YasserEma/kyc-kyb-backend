import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { OrganizationRelationshipsService } from './organization-relationships.service';
import { CreateOrganizationRelationshipDto } from './dtos/create-organization-relationship.dto';

@ApiTags('Organization Relationships')
@Controller('organization-relationships')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationRelationshipsController {
  constructor(
    private readonly organizationRelationshipsService: OrganizationRelationshipsService,
  ) {}

  @Get()
  @Roles('admin', 'manager', 'analyst')
  @ApiOperation({ summary: 'List organization relationships' })
  @ApiQuery({ name: 'primary_organization_id', required: false, type: String })
  @ApiQuery({ name: 'related_organization_id', required: false, type: String })
  @ApiQuery({ name: 'relationship_type', required: false, type: String })
  @ApiQuery({ name: 'verified', required: false, type: Boolean })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of organization relationships' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async listRelationships(
    @Query('primary_organization_id') primaryOrganizationId?: string,
    @Query('related_organization_id') relatedOrganizationId?: string,
    @Query('relationship_type') relationshipType?: string,
    @Query('verified') verified?: boolean,
  ) {
    return this.organizationRelationshipsService.listRelationships(
      primaryOrganizationId,
      relatedOrganizationId,
      relationshipType,
      verified,
    );
  }

  @Get(':id')
  @Roles('admin', 'manager', 'analyst')
  @ApiOperation({ summary: 'Get organization relationship by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Organization relationship details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Relationship not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async getRelationshipById(@Param('id') id: string) {
    return this.organizationRelationshipsService.getRelationshipById(id);
  }

  @Post()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create organization relationship' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Organization relationship created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async createRelationship(@Req() req: Request, @Body() dto: CreateOrganizationRelationshipDto) {
    const payload = req.user as any;
    dto.created_by = payload.sub;
    return this.organizationRelationshipsService.createRelationship(dto);
  }

  @Put(':id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update organization relationship' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Organization relationship updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Relationship not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async updateRelationship(
    @Param('id') id: string,
    @Body() updates: Partial<CreateOrganizationRelationshipDto>,
  ) {
    // You might want to get the current user from the request
    const updatedBy = 'system-user'; // Replace with actual user ID from request
    return this.organizationRelationshipsService.updateRelationship(id, updates, updatedBy);
  }

  @Put(':id/verify')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update verification status of organization relationship' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Verification status updated successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Relationship not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async updateVerificationStatus(
    @Param('id') id: string,
    @Query('verified') verified: boolean,
  ) {
    // You might want to get the current user from the request
    const verifiedBy = 'system-user'; // Replace with actual user ID from request
    return this.organizationRelationshipsService.updateVerificationStatus(id, verified, verifiedBy);
  }

  @Get('organization/:organization_id')
  @Roles('admin', 'manager', 'analyst')
  @ApiOperation({ summary: 'Get organization relationships by organization ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of organization relationships' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async getOrganizationRelationships(@Param('organization_id') organizationId: string) {
    return this.organizationRelationshipsService.getOrganizationRelationships(organizationId);
  }

  @Get('organization/:organization_id/statistics')
  @Roles('admin', 'manager', 'analyst')
  @ApiOperation({ summary: 'Get organization relationship statistics' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Organization relationship statistics' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async getRelationshipStatistics(@Param('organization_id') organizationId: string) {
    return this.organizationRelationshipsService.getRelationshipStatistics(organizationId);
  }

  @Delete(':id')
  @Roles('admin', 'manager')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete organization relationship' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Organization relationship deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Relationship not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
  async deleteRelationship(@Param('id') id: string) {
    // You might want to get the current user from the request
    const deletedBy = 'system-user'; // Replace with actual user ID from request
    await this.organizationRelationshipsService.deleteRelationship(id, deletedBy);
  }
}