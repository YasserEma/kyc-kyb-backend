import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateDocumentConfigurationDto {
  @ApiProperty({ example: 'Passport' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'PASSPORT' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ type: [String], example: ['pdf', 'docx', 'jpg'] })
  @IsArray()
  @IsString({ each: true })
  allowed_extensions!: string[];

  @ApiProperty({ example: 5242880 })
  @IsNumber()
  @Min(0)
  max_size_bytes!: number;

  @ApiProperty({ example: false })
  @IsBoolean()


  
  is_expiry_required!: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  is_active!: boolean;
}