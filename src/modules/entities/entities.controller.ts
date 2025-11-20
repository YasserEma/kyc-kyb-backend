import { Body, Controller, Get, Param, Patch, Post, Put, Query, Req, UseGuards, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { EntitiesService } from './services/entities.service';
import { ListEntitiesQueryDto } from './dtos/list-entities.dto';
import { CreateIndividualEntityDto } from './dtos/create-individual-entity.dto';
import { CreateOrganizationEntityDto } from './dtos/create-organization-entity.dto';
import { UpdateEntityDto } from './dtos/update-entity.dto';
import { UpdateEntityStatusDto } from './dtos/update-entity-status.dto';
import { BulkActionDto } from './dtos/bulk-action.dto';
import { ExportEntitiesDto } from './dtos/export-entities.dto';
import { AddDocumentDto } from './dtos/add-document.dto';
import { AddCustomFieldsDto } from './dtos/add-custom-fields.dto';

@ApiTags('Entities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst', 'viewer')
  @ApiOperation({ summary: 'List entities with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Entities listed successfully' })
  async listEntities(@Req() req: Request, @Query() query: ListEntitiesQueryDto) {
    const payload = req.user as any;
    return this.entitiesService.listEntities(payload.subscriberId, query);
  }

  @Get(':entity_id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst', 'viewer')
  @ApiOperation({ summary: 'Get entity details' })
  @ApiParam({ name: 'entity_id', required: true })
  @ApiResponse({ status: 200, description: 'Entity details returned' })
  async getEntityDetails(@Req() req: Request, @Param('entity_id') entityId: string) {
    const payload = req.user as any;
    return this.entitiesService.getEntityDetails(payload.subscriberId, entityId);
  }

  @Get(':entity_id/individual')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst', 'viewer')
  @ApiOperation({ summary: 'Get individual profile by entity ID' })
  @ApiParam({ name: 'entity_id', required: true })
  @ApiResponse({ status: 200, description: 'Individual profile returned' })
  async getIndividualProfile(@Req() req: Request, @Param('entity_id') entityId: string) {
    const payload = req.user as any;
    return this.entitiesService.getIndividualProfileByEntityId(payload.subscriberId, entityId);
  }

  @Get(':entity_id/organization')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst', 'viewer')
  @ApiOperation({ summary: 'Get organization profile by entity ID' })
  @ApiParam({ name: 'entity_id', required: true })
  @ApiResponse({ status: 200, description: 'Organization profile returned' })
  async getOrganizationProfile(@Req() req: Request, @Param('entity_id') entityId: string) {
    const payload = req.user as any;
    return this.entitiesService.getOrganizationProfileByEntityId(payload.subscriberId, entityId);
  }

  @Post('individual')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create an individual entity' })
  @ApiResponse({ status: 201, description: 'Individual entity created' })
  async createIndividualEntity(@Req() req: Request, @Body() dto: CreateIndividualEntityDto) {
    const payload = req.user as any;
    return this.entitiesService.createIndividualEntity(payload.subscriberId, payload.sub, dto);
  }

  @Post('organization')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create an organization entity' })
  @ApiResponse({ status: 201, description: 'Organization entity created' })
  async createOrganizationEntity(@Req() req: Request, @Body() dto: CreateOrganizationEntityDto) {
    const payload = req.user as any;
    return this.entitiesService.createOrganizationEntity(payload.subscriberId, payload.sub, dto);
  }

  @Post(':entity_id/documents')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Add document to entity' })
  @ApiParam({ name: 'entity_id', required: true })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ status: 201, description: 'Document added successfully' })
  async addDocument(
    @Req() req: Request,
    @Param('entity_id') entityId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: AddDocumentDto
  ) {
    const payload = req.user as any;
    return this.entitiesService.addDocument(payload.subscriberId, entityId, payload.sub, dto, file);
  }

  @Post(':entity_id/custom-fields')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Add custom fields to entity' })
  @ApiParam({ name: 'entity_id', required: true })
  @ApiResponse({ status: 201, description: 'Custom fields added successfully' })
  async addCustomFields(
    @Req() req: Request,
    @Param('entity_id') entityId: string,
    @Body() dto: AddCustomFieldsDto
  ) {
    const payload = req.user as any;
    return this.entitiesService.addCustomFields(entityId, payload.sub, dto);
  }

  @Put(':entity_id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update entity fields' })
  @ApiParam({ name: 'entity_id', required: true })
  @ApiResponse({ status: 200, description: 'Entity updated' })
  async updateEntity(
    @Req() req: Request,
    @Param('entity_id') entityId: string,
    @Body() dto: UpdateEntityDto,
  ) {
    const payload = req.user as any;
    return this.entitiesService.updateEntity(payload.subscriberId, entityId, payload.sub, dto);
  }

  @Patch(':entity_id/status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update entity status' })
  @ApiParam({ name: 'entity_id', required: true })
  @ApiResponse({ status: 200, description: 'Entity status updated' })
  async updateEntityStatus(
    @Req() req: Request,
    @Param('entity_id') entityId: string,
    @Body() dto: UpdateEntityStatusDto,
  ) {
    const payload = req.user as any;
    return this.entitiesService.updateEntityStatus(payload.subscriberId, entityId, payload.sub, dto);
  }

  @Post('bulk')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Perform bulk actions on entities' })
  @ApiResponse({ status: 200, description: 'Bulk action performed' })
  async bulkAction(@Req() req: Request, @Body() dto: BulkActionDto) {
    const payload = req.user as any;
    return this.entitiesService.bulkAction(payload.subscriberId, payload.sub, dto);
  }

  @Get(':entity_id/history')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst', 'viewer')
  @ApiOperation({ summary: 'Get entity change history' })
  @ApiParam({ name: 'entity_id', required: true })
  async getEntityHistory(@Param('entity_id') entityId: string) {
    return this.entitiesService.getEntityHistory(entityId);
  }

  @Get('export')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst')
  @ApiOperation({ summary: 'Export entities as CSV' })
  async exportEntities(@Req() req: Request, @Res() res: Response, @Query() query: ExportEntitiesDto) {
    const payload = req.user as any;
    const result = await this.entitiesService.exportEntities(payload.subscriberId, query);
    const filename = `entities.${result.format}`;

    if (result.format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
    } else if (result.format === 'xlsx') {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    } else {
      res.setHeader('Content-Type', 'application/octet-stream');
    }
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(result.content);
  }

  @Get(':entity_id/nationality')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst', 'viewer')
  @ApiOperation({ summary: 'Get nationality/country data for an entity' })
  @ApiParam({ name: 'entity_id', required: true })
  @ApiResponse({ 
    status: 200, 
    description: 'Nationality/country data returned successfully',
    schema: {
      type: 'object',
      properties: {
        entity_id: { type: 'string' },
        entity_name: { type: 'string' },
        nationality: { 
          type: 'array',
          items: { type: 'string' },
          description: 'Nationality data (for individual entities)'
        },
        country_of_residence: { 
          type: 'array',
          items: { type: 'string' },
          description: 'Country of residence data (for individual entities)'
        },
        country_of_incorporation: { 
          type: 'string',
          description: 'Country of incorporation (for organization entities)'
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Entity not found' })
  async getEntityNationality(@Req() req: Request, @Param('entity_id') entityId: string) {
    const payload = req.user as any;
    return this.entitiesService.getEntityNationality(payload.subscriberId, entityId);
  }
}