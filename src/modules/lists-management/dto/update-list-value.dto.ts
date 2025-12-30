import { PartialType } from '@nestjs/swagger';
import { CreateListValueDto } from './create-list-value.dto';

/**
 * DTO for updating an existing list value
 * All fields are optional
 */
export class UpdateListValueDto extends PartialType(CreateListValueDto) {}
