import { IsUUID, IsString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMacroDto {
  @ApiProperty({ example: 'Saludo inicial' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Hola, soy de Logimarket. ¿En qué puedo ayudarte?' })
  @IsString()
  content: string;

  @ApiProperty({ example: '/saludo' })
  @IsString()
  shortcut: string;

  @ApiProperty({ example: 'uuid-usuario' })
  @IsUUID()
  created_by_id: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
