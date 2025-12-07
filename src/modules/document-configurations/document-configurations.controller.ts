import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DocumentConfigurationsService } from './document-configurations.service';
import { CreateDocumentConfigurationDto } from './dtos/create-document-configuration.dto';

@ApiTags('Admin Document Configurations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/document-configurations')
export class DocumentConfigurationsController {
  constructor(private readonly service: DocumentConfigurationsService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create a document configuration' })
  @ApiResponse({ status: 201 })
  async create(@Body() dto: CreateDocumentConfigurationDto) {
    return this.service.create(dto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List active document configurations' })
  @ApiResponse({ status: 200 })
  async list() {
    return this.service.list();
  }
}