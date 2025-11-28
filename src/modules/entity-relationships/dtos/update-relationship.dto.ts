import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsDateString } from 'class-validator';

/**
 * DTO for updating an existing relationship
 * Note: Entity IDs (from_entity_id, to_entity_id) are immutable
 */
export class UpdateRelationshipDto {
    @ApiPropertyOptional({
        description: 'Updated relationship type',
        example: 'former_director'
    })
    @IsOptional()
    @IsString()
    relationship_type?: string;

    @ApiPropertyOptional({
        description: 'Updated metadata',
        example: { ownership_percentage: 30, notes: 'Increased stake' }
    })
    @IsOptional()
    metadata?: Record<string, any>;

    @ApiPropertyOptional({
        description: 'Updated start date',
        example: '2024-06-01'
    })
    @IsOptional()
    @IsDateString()
    start_date?: string;

    @ApiPropertyOptional({
        description: 'Updated end date',
        example: '2026-01-01'
    })
    @IsOptional()
    @IsDateString()
    end_date?: string;

    @ApiPropertyOptional({
        description: 'Set relationship active/inactive status',
        example: false
    })
    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}
