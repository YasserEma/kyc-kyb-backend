import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { IndividualEntityRelationshipsService } from './individual-entity-relationships.service';

@ApiTags('Individual Relationships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('relationships')
export class IndividualEntityRelationshipsController {
  constructor(private readonly service: IndividualEntityRelationshipsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst', 'viewer')
  @ApiOperation({ summary: 'List relationships with filters and pagination' })
  async list(@Req() req: Request, @Query() query: any) {
    const payload = req.user as any;
    const { page, limit, sortBy, sortOrder, ...filters } = query || {};
    return this.service.listRelationships(filters, { page, limit, sortBy, sortOrder });
  }

  @Get('individual/:individual_id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst', 'viewer')
  @ApiOperation({ summary: 'List relationships for a specific individual' })
  @ApiParam({ name: 'individual_id', required: true })
  async listByIndividual(@Req() req: Request, @Param('individual_id') individualId: string, @Query() query: any) {
    const { page, limit, sortBy, sortOrder, ...filters } = query || {};
    return this.service.listByIndividual(individualId, filters, { page, limit, sortBy, sortOrder });
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst')
  @ApiOperation({ summary: 'Create a new relationship between individuals' })
  async create(@Req() req: Request, @Body() dto: any) {
    const payload = req.user as any;
    return this.service.createRelationship({ subscriberId: payload.subscriberId, userId: payload.userId, data: dto });
  }

  @Patch(':relationship_id/verify')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst')
  @ApiOperation({ summary: 'Update relationship verification status' })
  @ApiParam({ name: 'relationship_id', required: true })
  async verify(@Req() req: Request, @Param('relationship_id') id: string, @Body() dto: { is_verified: boolean; verification_method?: string }) {
    const payload = req.user as any;
    return this.service.verifyRelationship(id, payload.userId, dto?.is_verified, dto?.verification_method);
  }

  @Patch(':relationship_id/review')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst')
  @ApiOperation({ summary: 'Set next review date for relationship' })
  @ApiParam({ name: 'relationship_id', required: true })
  async review(@Req() req: Request, @Param('relationship_id') id: string, @Body() dto: { next_review_date?: Date }) {
    const payload = req.user as any;
    return this.service.reviewRelationship(id, payload.userId, dto?.next_review_date);
  }

  @Patch(':relationship_id/risk')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst')
  @ApiOperation({ summary: 'Update relationship risk level' })
  @ApiParam({ name: 'relationship_id', required: true })
  async updateRisk(@Req() req: Request, @Param('relationship_id') id: string, @Body() dto: { risk_level: string; risk_factors?: string }) {
    const payload = req.user as any;
    return this.service.updateRisk(id, payload.userId, dto?.risk_level, dto?.risk_factors);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst', 'viewer')
  @ApiOperation({ summary: 'Get relationships statistics for dashboards' })
  async stats(@Query() query: any) {
    return this.service.getStatistics(query);
  }
}