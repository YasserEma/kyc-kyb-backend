import { Controller, Post, Get, Put, Delete, UseGuards, UseInterceptors, UploadedFile, Body, Param, Req, Query } from '@nestjs/common';
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

  @Get(':documentId')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Get a specific document by ID' })
  @ApiParam({ name: 'entityId', required: true })
  @ApiParam({ name: 'documentId', required: true })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async getDocument(
    @Req() req: Request,
    @Param('documentId') documentId: string,
  ) {
    const payload = req.user as any;
    return this.documentsService.getDocumentById(payload.subscriberId, documentId);
  }

  @Put(':documentId')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update document metadata', description: 'Updates document properties like name, description, expiry date, and status. Does not replace the file.' })
  @ApiParam({ name: 'entityId', required: true })
  @ApiParam({ name: 'documentId', required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Updated Passport' },
        description: { type: 'string', example: 'Updated description' },
        expiry_date: { type: 'string', format: 'date', example: '2025-12-31' },
        document_status: { type: 'string', enum: ['uploaded', 'processing', 'processed', 'verified', 'rejected', 'expired', 'archived'] },
        verification_status: { type: 'string', enum: ['pending', 'in_progress', 'verified', 'rejected', 'expired'] },
        metadata: { type: 'object', description: 'Custom metadata object' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Document updated successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async updateDocument(
    @Req() req: Request,
    @Param('documentId') documentId: string,
    @Body() dto: { name?: string; description?: string; expiry_date?: string; document_status?: string; verification_status?: string; metadata?: Record<string, any> },
  ) {
    const payload = req.user as any;
    return this.documentsService.updateDocument(payload.subscriberId, documentId, payload.sub, dto);
  }

  @Delete(':documentId')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Delete a document (soft delete)', description: 'Marks the document as deleted. The file is not physically removed.' })
  @ApiParam({ name: 'entityId', required: true })
  @ApiParam({ name: 'documentId', required: true })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async deleteDocument(
    @Req() req: Request,
    @Param('documentId') documentId: string,
  ) {
    const payload = req.user as any;
    return this.documentsService.deleteDocument(payload.subscriberId, documentId, payload.sub);
  }

  @Post(':documentId/verify')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Verify or reject a document', description: 'Set the verification status of a document' })
  @ApiParam({ name: 'entityId', required: true })
  @ApiParam({ name: 'documentId', required: true })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        verification_status: { type: 'string', enum: ['verified', 'rejected', 'pending'], example: 'verified' },
        notes: { type: 'string', example: 'Document verified after manual review' },
      },
      required: ['verification_status'],
    },
  })
  @ApiResponse({ status: 200, description: 'Document verification status updated' })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async verifyDocument(
    @Req() req: Request,
    @Param('documentId') documentId: string,
    @Body() dto: { verification_status: 'verified' | 'rejected' | 'pending'; notes?: string },
  ) {
    const payload = req.user as any;
    return this.documentsService.verifyDocument(payload.subscriberId, documentId, payload.sub, dto);
  }
}