import { PartialType } from '@nestjs/swagger';
import { CreateListDto } from './create-list.dto';

/**
 * DTO for updating an existing list category
 * All fields are optional
 */
export class UpdateListDto extends PartialType(CreateListDto) {}
