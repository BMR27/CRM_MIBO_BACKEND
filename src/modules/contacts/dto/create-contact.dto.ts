import { IsString, Matches, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({ example: '+525512345678', description: 'Teléfono en formato internacional E.164' })
  @Matches(/^\+\d{10,15}$/, { message: 'phone_number must be a valid international phone number' })
  phone_number: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsOptional()
  @IsUrl()
  avatar_url?: string;
}
