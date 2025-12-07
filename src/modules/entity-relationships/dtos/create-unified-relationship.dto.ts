import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    ValidateNested,
    IsDateString,
    ValidateIf,
    IsObject
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateIndividualEntityDto } from '../../entities/dtos/create-individual-entity.dto';
import { CreateOrganizationEntityDto } from '../../entities/dtos/create-organization-entity.dto';

/**
 * DTO for creating a unified entity relationship
 * Supports two scenarios:
 * 1. Link to existing entity - provide target_entity_id
 * 2. Link to new entity - provide new_target_entity with entity data
 */
export class CreateUnifiedRelationshipDto {
    @ApiPropertyOptional({
        description: 'UUID of existing entity to link to (mutually exclusive with new_target_entity)',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsOptional()
    @IsUUID()
    @ValidateIf(o => !o.new_target_entity)
    target_entity_id?: string;

    @ApiPropertyOptional({
        description: 'Data for creating a new entity to link to (mutually exclusive with target_entity_id)',
        oneOf: [
            { $ref: '#/components/schemas/CreateIndividualEntityDto' },
            { $ref: '#/components/schemas/CreateOrganizationEntityDto' }
        ]
    })
    @IsOptional()
    @IsObject()
    @ValidateIf(o => !o.target_entity_id)
    new_target_entity?: CreateIndividualEntityDto | CreateOrganizationEntityDto;

    @ApiProperty({
        description: 'Type of relationship',
        example: 'director',
        examples: ['subsidiary', 'director', 'spouse', 'shareholder', 'partner', 'employee']
    })
    @IsString()
    @IsNotEmpty()
    relationship_type!: string;

    @ApiPropertyOptional({
        description: 'Additional metadata for the relationship (e.g., ownership_percentage, job_title, notes)',
        example: { ownership_percentage: 25, job_title: 'CEO' }
    })
    @IsOptional()
    metadata?: Record<string, any>;

    @ApiPropertyOptional({
        description: 'Start date of the relationship',
        example: '2024-01-01'
    })
    @IsOptional()
    @IsDateString()
    start_date?: string;

    @ApiPropertyOptional({
        description: 'End date of the relationship',
        example: '2025-12-31'
    })
    @IsOptional()
    @IsDateString()
    end_date?: string;
}
