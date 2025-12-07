import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for entity relationship with populated entity details
 */
export class RelationshipResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    from_entity_id!: string;

    @ApiProperty()
    to_entity_id!: string;

    @ApiProperty({ description: 'Source entity details' })
    from_entity!: {
        id: string;
        name: string;
        entity_type: string;
        reference_number: string;
    };

    @ApiProperty({ description: 'Target entity details' })
    to_entity!: {
        id: string;
        name: string;
        entity_type: string;
        reference_number: string;
    };

    @ApiProperty()
    relationship_type!: string;

    @ApiProperty({ required: false })
    metadata?: Record<string, any>;

    @ApiProperty({ required: false })
    start_date?: Date;

    @ApiProperty({ required: false })
    end_date?: Date;

    @ApiProperty()
    is_active!: boolean;

    @ApiProperty()
    created_at!: Date;

    @ApiProperty()
    updated_at!: Date;
}
