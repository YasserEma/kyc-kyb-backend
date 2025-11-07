import { Body, Controller, Get, Param, Patch, Post, Put, Query, Req, UseGuards, Delete, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SubscriberUsersService } from './subscriber-users.service';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { ExportUsersDto } from './dto/export-users.dto';
import { UpdatePermissionsDto } from './dto/update-permissions.dto';

@ApiTags('User Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class SubscriberUsersController {
  constructor(private readonly usersService: SubscriberUsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'List users within subscriber with filters and pagination' })
  async listUsers(@Req() req: Request, @Query() query: ListUsersQueryDto) {
    const payload = req.user as any;
    return this.usersService.listUsers(payload.subscriberId, query);
  }

  @Get(':user_id')
  @UseGuards(RolesGuard)
  @Roles('admin', 'manager', 'analyst', 'viewer')
  @ApiOperation({ summary: 'Get user details and activity summary' })
  @ApiParam({ name: 'user_id', required: true })
  async getUserDetails(@Req() req: Request, @Param('user_id') userId: string) {
    const payload = req.user as any;
    return this.usersService.getUserDetails(userId, payload.subscriberId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new user account (admin only)' })
  async createUser(@Req() req: Request, @Body() dto: CreateUserDto) {
    const payload = req.user as any;
    return this.usersService.createUser(payload.subscriberId, payload.userId, dto);
  }

  @Put(':user_id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update user details (admin only)' })
  async updateUser(@Req() req: Request, @Param('user_id') userId: string, @Body() dto: UpdateUserDto) {
    const payload = req.user as any;
    return this.usersService.updateUser(payload.subscriberId, userId, dto);
  }

  @Patch(':user_id/password')
  @ApiOperation({ summary: 'Change user password (self or admin)' })
  async changePassword(@Req() req: Request, @Param('user_id') userId: string, @Body() dto: ChangePasswordDto) {
    const payload = req.user as any;
    return this.usersService.changeUserPassword(payload.subscriberId, userId, { userId: payload.userId, role: payload.role }, dto);
  }

  @Patch(':user_id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update user status (admin only)' })
  async setUserStatus(@Req() req: Request, @Param('user_id') userId: string, @Body() dto: UpdateStatusDto) {
    const payload = req.user as any;
    return this.usersService.setUserStatus(userId, dto, payload.subscriberId, payload.userId);
  }

  @Delete(':user_id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Delete user (admin only) with last-admin guard' })
  async deleteUser(@Req() req: Request, @Param('user_id') userId: string) {
    const payload = req.user as any;
    return this.usersService.deleteUser(userId, payload.subscriberId, payload.userId);
  }

  @Get('export')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Export users to CSV using filters (admin only)' })
  @ApiResponse({ status: 200, description: 'CSV export of users' })
  async exportUsers(@Req() req: Request, @Res() res: Response, @Query() query: ExportUsersDto) {
    const payload = req.user as any;
    const csv = await this.usersService.exportUsers(query, payload.subscriberId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
    return res.send(csv);
  }

  @Get(':user_id/permissions')
  @ApiOperation({ summary: 'Get user permissions (self or admin)' })
  async getUserPermissions(@Req() req: Request, @Param('user_id') userId: string) {
    const payload = req.user as any;
    return this.usersService.getUserPermissions(userId, payload.subscriberId, { userId: payload.userId, role: payload.role });
  }

  @Put(':user_id/permissions')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update user permissions (admin only)' })
  async updateUserPermissions(@Req() req: Request, @Param('user_id') userId: string, @Body() dto: UpdatePermissionsDto) {
    const payload = req.user as any;
    return this.usersService.updateUserPermissions(userId, dto, payload.subscriberId);
  }
}