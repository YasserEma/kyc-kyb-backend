import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ListsManagementService } from './lists-management.service';
import {
  CreateListDto,
  UpdateListDto,
  CreateListValueDto,
  UpdateListValueDto,
  ListQueryDto,
  ToggleStatusDto,
} from './dto';

@ApiTags('Lists Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lists')
export class ListsManagementController {
  constructor(private readonly listsManagementService: ListsManagementService) {}

  // ============================================
  // LIST ENDPOINTS
  // ============================================

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst', 'viewer')
  @ApiOperation({
    summary: 'List all lists',
    description: 'Get all lists for the current subscriber with pagination and filters',
  })
  @ApiResponse({ status: 200, description: 'Lists retrieved successfully' })
  async getLists(@Req() req: Request, @Query() query: ListQueryDto) {
    const payload = req.user as any;
    return this.listsManagementService.getLists(payload.subscriberId, query);
  }

  @Get('lookup/:listType')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst', 'viewer')
  @ApiOperation({
    summary: 'Get lookup values by list type',
    description: 'Get active values for frontend dropdowns filtered by list type',
  })
  @ApiParam({ name: 'listType', description: 'List type (e.g., custom, whitelist)', example: 'custom' })
  @ApiResponse({ status: 200, description: 'Lookup values retrieved successfully' })
  async getLookupValues(
    @Req() req: Request,
    @Param('listType') listType: string,
  ) {
    const payload = req.user as any;
    const values = await this.listsManagementService.getLookupValues(payload.subscriberId, listType);
    return {
      success: true,
      data: values,
      meta: {
        total: values.length,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get('lookup/name/:listName')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst', 'viewer')
  @ApiOperation({
    summary: 'Get lookup values by list name',
    description: 'Get active values for a specific list by name (e.g., Nationalities)',
  })
  @ApiParam({ name: 'listName', description: 'List name', example: 'Nationalities' })
  @ApiResponse({ status: 200, description: 'Lookup values retrieved successfully' })
  async getLookupValuesByName(
    @Req() req: Request,
    @Param('listName') listName: string,
  ) {
    const payload = req.user as any;
    const values = await this.listsManagementService.getLookupValuesByListName(
      payload.subscriberId,
      listName,
    );
    return {
      success: true,
      data: values,
      meta: {
        total: values.length,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst', 'viewer')
  @ApiOperation({
    summary: 'Get list by ID',
    description: 'Get a single list with its values',
  })
  @ApiParam({ name: 'id', description: 'List UUID' })
  @ApiResponse({ status: 200, description: 'List retrieved successfully' })
  @ApiResponse({ status: 404, description: 'List not found' })
  async getListById(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('include_values') includeValues: string = 'true',
  ) {
    const payload = req.user as any;
    const list = await this.listsManagementService.getListById(
      payload.subscriberId,
      id,
      includeValues === 'true',
    );
    return {
      success: true,
      data: list,
    };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Create a new list',
    description: 'Create a new list category (e.g., Nationalities, Employee Levels)',
  })
  @ApiResponse({ status: 201, description: 'List created successfully' })
  async createList(@Req() req: Request, @Body() dto: CreateListDto) {
    const payload = req.user as any;
    const list = await this.listsManagementService.createList(
      payload.subscriberId,
      payload.sub,
      dto,
    );
    return {
      success: true,
      data: list,
      message: 'List created successfully',
    };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Update a list',
    description: 'Update list properties',
  })
  @ApiParam({ name: 'id', description: 'List UUID' })
  @ApiResponse({ status: 200, description: 'List updated successfully' })
  @ApiResponse({ status: 404, description: 'List not found' })
  async updateList(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateListDto,
  ) {
    const payload = req.user as any;
    const list = await this.listsManagementService.updateList(
      payload.subscriberId,
      id,
      payload.sub,
      dto,
    );
    return {
      success: true,
      data: list,
      message: 'List updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Delete a list',
    description: 'Soft delete (archive) a list',
  })
  @ApiParam({ name: 'id', description: 'List UUID' })
  @ApiResponse({ status: 200, description: 'List deleted successfully' })
  @ApiResponse({ status: 404, description: 'List not found' })
  async deleteList(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const payload = req.user as any;
    return this.listsManagementService.deleteList(payload.subscriberId, id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Toggle list status',
    description: 'Enable or disable a list',
  })
  @ApiParam({ name: 'id', description: 'List UUID' })
  @ApiResponse({ status: 200, description: 'List status updated successfully' })
  @ApiResponse({ status: 404, description: 'List not found' })
  async toggleListStatus(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ToggleStatusDto,
  ) {
    const payload = req.user as any;
    const list = await this.listsManagementService.toggleListStatus(
      payload.subscriberId,
      id,
      dto.is_active ?? true,
    );
    return {
      success: true,
      data: list,
      message: `List ${dto.is_active ? 'activated' : 'deactivated'} successfully`,
    };
  }

  // ============================================
  // LIST VALUE ENDPOINTS
  // ============================================

  @Get(':id/values')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst', 'viewer')
  @ApiOperation({
    summary: 'Get list values',
    description: 'Get all values in a list',
  })
  @ApiParam({ name: 'id', description: 'List UUID' })
  @ApiResponse({ status: 200, description: 'Values retrieved successfully' })
  @ApiResponse({ status: 404, description: 'List not found' })
  async getListValues(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('active_only') activeOnly: string = 'false',
  ) {
    const payload = req.user as any;
    return this.listsManagementService.getListValues(
      payload.subscriberId,
      id,
      activeOnly === 'true',
    );
  }

  @Post(':id/values')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Add value to list',
    description: 'Add a new value/item to a list',
  })
  @ApiParam({ name: 'id', description: 'List UUID' })
  @ApiResponse({ status: 201, description: 'Value added successfully' })
  @ApiResponse({ status: 404, description: 'List not found' })
  async createListValue(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateListValueDto,
  ) {
    const payload = req.user as any;
    const value = await this.listsManagementService.createListValue(
      payload.subscriberId,
      id,
      payload.sub,
      dto,
    );
    return {
      success: true,
      data: value,
      message: 'Value added to list successfully',
    };
  }

  @Post(':id/values/batch')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Batch add values to list',
    description: 'Add multiple values to a list at once',
  })
  @ApiParam({ name: 'id', description: 'List UUID' })
  @ApiResponse({ status: 201, description: 'Values added successfully' })
  @ApiResponse({ status: 404, description: 'List not found' })
  async batchCreateListValues(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { values: CreateListValueDto[] },
  ) {
    const payload = req.user as any;
    const result = await this.listsManagementService.batchCreateListValues(
      payload.subscriberId,
      id,
      payload.sub,
      dto.values,
    );
    return {
      success: true,
      data: result,
      message: `${result.created} values added to list`,
    };
  }

  @Put(':id/values/:valueId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Update list value',
    description: 'Update an existing value in a list',
  })
  @ApiParam({ name: 'id', description: 'List UUID' })
  @ApiParam({ name: 'valueId', description: 'Value UUID' })
  @ApiResponse({ status: 200, description: 'Value updated successfully' })
  @ApiResponse({ status: 404, description: 'List or value not found' })
  async updateListValue(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('valueId', ParseUUIDPipe) valueId: string,
    @Body() dto: UpdateListValueDto,
  ) {
    const payload = req.user as any;
    const value = await this.listsManagementService.updateListValue(
      payload.subscriberId,
      id,
      valueId,
      payload.sub,
      dto,
    );
    return {
      success: true,
      data: value,
      message: 'Value updated successfully',
    };
  }

  @Delete(':id/values/:valueId')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Delete list value',
    description: 'Remove a value from a list (soft delete)',
  })
  @ApiParam({ name: 'id', description: 'List UUID' })
  @ApiParam({ name: 'valueId', description: 'Value UUID' })
  @ApiResponse({ status: 200, description: 'Value deleted successfully' })
  @ApiResponse({ status: 404, description: 'List or value not found' })
  async deleteListValue(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('valueId', ParseUUIDPipe) valueId: string,
  ) {
    const payload = req.user as any;
    return this.listsManagementService.deleteListValue(
      payload.subscriberId,
      id,
      valueId,
    );
  }

  @Patch(':id/values/:valueId/status')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager')
  @ApiOperation({
    summary: 'Toggle value status',
    description: 'Enable or disable a list value',
  })
  @ApiParam({ name: 'id', description: 'List UUID' })
  @ApiParam({ name: 'valueId', description: 'Value UUID' })
  @ApiResponse({ status: 200, description: 'Value status updated successfully' })
  @ApiResponse({ status: 404, description: 'List or value not found' })
  async toggleListValueStatus(
    @Req() req: Request,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('valueId', ParseUUIDPipe) valueId: string,
    @Body() dto: ToggleStatusDto,
  ) {
    const payload = req.user as any;
    const value = await this.listsManagementService.toggleListValueStatus(
      payload.subscriberId,
      id,
      valueId,
      dto.is_active ?? true,
    );
    return {
      success: true,
      data: value,
      message: `Value ${dto.is_active ? 'activated' : 'deactivated'} successfully`,
    };
  }
}
