import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Body, Param, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UploadDocumentDto } from './dtos/upload-document.dto';
import { DocumentsService } from './documents.service';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('entities/:entityId/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

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
}