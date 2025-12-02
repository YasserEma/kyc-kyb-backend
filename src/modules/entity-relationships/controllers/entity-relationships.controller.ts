import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EntityRelationshipsService } from '../services/entity-relationships.service';
import { CreateUnifiedRelationshipDto } from '../dtos/create-unified-relationship.dto';
import { UpdateRelationshipDto } from '../dtos/update-relationship.dto';
import { RelationshipResponseDto } from '../dtos/relationship-response.dto';

@ApiTags('Entity Relationships')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('entities')
export class EntityRelationshipsController {
    constructor(
        private readonly relationshipsService: EntityRelationshipsService
    ) { }

    @Post(':entityId/relationships')
    @ApiOperation({
        summary: 'Create a new relationship from an entity',
        description: 'Link an entity to another entity (existing or new). Supports creating new entities inline.'
    })
    @ApiParam({ name: 'entityId', description: 'Source entity UUID' })
    @ApiResponse({
        status: 201,
        description: 'Relationship created successfully',
        type: RelationshipResponseDto
    })
    @ApiResponse({ status: 400, description: 'Invalid request data' })
    @ApiResponse({ status: 404, description: 'Source entity not found' })
    @ApiResponse({ status: 409, description: 'Duplicate relationship exists' })
    async createRelationship(
        @Param('entityId') entityId: string,
        @Body() dto: CreateUnifiedRelationshipDto,
        @Req() req: any
    ) {
        const subscriberId = req.user.subscriberId;
        const userId = req.user.sub;

        return this.relationshipsService.createRelationship(
            subscriberId,
            entityId,
            userId,
            dto
        );
    }

    @Get(':entityId/relationships')
    @ApiOperation({
        summary: 'List all relationships for an entity',
        description: 'Returns all relationships where the entity is either the source or target'
    })
    @ApiParam({ name: 'entityId', description: 'Entity UUID' })
    @ApiQuery({
        name: 'active_only',
        required: false,
        type: Boolean,
        description: 'Filter for active relationships only'
    })
    @ApiResponse({
        status: 200,
        description: 'List of relationships',
        type: [RelationshipResponseDto]
    })
    @ApiResponse({ status: 404, description: 'Entity not found' })
    async listRelationships(
        @Param('entityId') entityId: string,
        @Query('active_only') activeOnly: string,
        @Req() req: any
    ) {
        const subscriberId = req.user.subscriberId;
        const isActiveOnly = activeOnly === 'true';

        return this.relationshipsService.findRelationshipsByEntity(
            subscriberId,
            entityId,
            isActiveOnly
        );
    }

    @Get('relationships/:id')
    @ApiOperation({ summary: 'Get a specific relationship by ID' })
    @ApiParam({ name: 'id', description: 'Relationship UUID' })
    @ApiResponse({
        status: 200,
        description: 'Relationship details',
        type: RelationshipResponseDto
    })
    @ApiResponse({ status: 404, description: 'Relationship not found' })
    async getRelationship(
        @Param('id') id: string,
        @Req() req: any
    ) {
        const subscriberId = req.user.subscriberId;

        return this.relationshipsService.getRelationshipById(subscriberId, id);
    }

    @Patch('relationships/:id')
    @ApiOperation({
        summary: 'Update an existing relationship',
        description: 'Update relationship properties. Note: Entity IDs cannot be changed.'
    })
    @ApiParam({ name: 'id', description: 'Relationship UUID' })
    @ApiResponse({
        status: 200,
        description: 'Relationship updated successfully',
        type: RelationshipResponseDto
    })
    @ApiResponse({ status: 404, description: 'Relationship not found' })
    async updateRelationship(
        @Param('id') id: string,
        @Body() dto: UpdateRelationshipDto,
        @Req() req: any
    ) {
        const subscriberId = req.user.subscriberId;
        const userId = req.user.sub;

        return this.relationshipsService.updateRelationship(
            subscriberId,
            id,
            userId,
            dto
        );
    }

    @Delete('relationships/:id')
    @ApiOperation({
        summary: 'Delete a relationship (soft delete)',
        description: 'Soft deletes the relationship. The record remains in the database but is marked as deleted.'
    })
    @ApiParam({ name: 'id', description: 'Relationship UUID' })
    @ApiResponse({
        status: 200,
        description: 'Relationship deleted successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Relationship deleted successfully' }
            }
        }
    })
    @ApiResponse({ status: 404, description: 'Relationship not found' })
    async deleteRelationship(
        @Param('id') id: string,
        @Req() req: any
    ) {
        const subscriberId = req.user.subscriberId;
        const userId = req.user.sub;

        return this.relationshipsService.deleteRelationship(subscriberId, id, userId);
    }
}
