import { IsEmail, IsIn, IsObject, IsOptional, IsString, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePublicLeadDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: ['web', 'api'], description: 'De dónde viene el lead. Por defecto "api".' })
  @IsOptional()
  @IsIn(['web', 'api'])
  source?: 'web' | 'api';

  @ApiPropertyOptional({ example: 'juan@ejemplo.com' })
  @ValidateIf((o) => !o.phone_number)
  @IsEmail({}, { message: 'email debe ser válido si no se envía phone_number' })
  email?: string;

  @ApiPropertyOptional({ example: '+525512345678' })
  @ValidateIf((o) => !o.email)
  @IsString({ message: 'phone_number es requerido si no se envía email' })
  phone_number?: string;

  @ApiPropertyOptional({ example: 'Acme Inc.' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ example: { utm_source: 'google', page: '/precios' } })
  @IsOptional()
  @IsObject()
  custom_fields?: Record<string, any>;
}
