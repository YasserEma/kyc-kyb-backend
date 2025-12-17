import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { LogsService } from './logs.service';
import { GetLogsQueryDto } from './dto/get-logs-query.dto';

@ApiTags('System Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List system logs with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Paginated list of logs returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async findAll(@Req() req: Request, @Query() query: GetLogsQueryDto) {
    const payload = req.user as any;
    return this.logsService.findAll(payload.subscriberId, query);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get log statistics (counts by severity, status, error rate, etc.)' })
  @ApiResponse({ status: 200, description: 'Log statistics returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getStats(@Req() req: Request, @Query() query: GetLogsQueryDto) {
    const payload = req.user as any;
    return this.logsService.getStats(payload.subscriberId, query);
  }

  @Get('errors')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get recent error logs' })
  @ApiResponse({ status: 200, description: 'Error logs returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getErrorLogs(@Req() req: Request, @Query('limit') limit?: number) {
    const payload = req.user as any;
    return this.logsService.findErrorLogs(payload.subscriberId, limit || 100);
  }

  @Get('recent-activity')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get recent activity logs' })
  @ApiResponse({ status: 200, description: 'Recent activity logs returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getRecentActivity(
    @Req() req: Request,
    @Query('hours') hours?: number,
    @Query('limit') limit?: number,
  ) {
    const payload = req.user as any;
    return this.logsService.findRecentActivity(payload.subscriberId, hours || 24, limit || 50);
  }

  @Get('correlation/:correlationId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get logs by correlation ID' })
  @ApiParam({ name: 'correlationId', description: 'Correlation ID to filter logs' })
  @ApiResponse({ status: 200, description: 'Correlated logs returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  async getByCorrelationId(@Param('correlationId') correlationId: string) {
    return this.logsService.findByCorrelationId(correlationId);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Get a single log by ID' })
  @ApiParam({ name: 'id', description: 'Log ID (UUID)' })
  @ApiResponse({ status: 200, description: 'Log details returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Log not found' })
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const payload = req.user as any;
    return this.logsService.findOne(payload.subscriberId, id);
  }
}
