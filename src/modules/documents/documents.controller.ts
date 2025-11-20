import { Controller, Post, Get, UseGuards, UseInterceptors, UploadedFile, Body, Param, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UploadDocumentDto } from './dtos/upload-document.dto';
import { DocumentsService } from './documents.service';
import { DocumentRepository } from './repositories/document.repository';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('entities/:entityId/documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly documentRepository: DocumentRepository,
  ) {}

  @Post('upload')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Upload a document for an entity' })
  @ApiParam({ name: 'entityId', required: true })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        document_configuration_id: { type: 'string', format: 'uuid' },
        name: { type: 'string', example: 'Passport Document' },
        description: { type: 'string', example: 'Customer identification document' },
        expiry_date: { type: 'string', format: 'date' },
        file: { type: 'string', format: 'binary' },
      },
      required: ['document_configuration_id', 'file'],
    },
  })
  @ApiResponse({ status: 201 })
  async upload(
    @Req() req: Request,
    @Param('entityId') entityId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
  ) {
    const payload = req.user as any;
    return this.documentsService.uploadDocument(entityId, payload.subscriberId, payload.sub, dto, file);
  }

  @Get()
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get all documents for an entity' })
  @ApiParam({ name: 'entityId', required: true })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'document_type', required: false, type: String })
  @ApiQuery({ name: 'document_status', required: false, type: String })
  @ApiQuery({ name: 'verification_status', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async getEntityDocuments(
    @Param('entityId') entityId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('document_type') documentType?: string,
    @Query('document_status') documentStatus?: string,
    @Query('verification_status') verificationStatus?: string,
  ) {
    const filters = {
      ...(documentType && { document_type: documentType }),
      ...(documentStatus && { document_status: documentStatus }),
      ...(verificationStatus && { verification_status: verificationStatus }),
    };

    const pagination = {
      page: page || 1,
      limit: limit || 10,
    };

    return this.documentRepository.findByEntityId(entityId, filters, pagination);
  }
}