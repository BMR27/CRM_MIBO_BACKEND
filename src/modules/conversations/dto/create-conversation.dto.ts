import { IsUUID, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ example: 'uuid-contacto' })
  @IsUUID()
  contact_id: string;

  @ApiPropertyOptional({ example: 'uuid-agente' })
  @IsOptional()
  @IsUUID()
  assigned_agent_id?: string;

  @ApiPropertyOptional({ enum: ['active', 'paused', 'resolved'], example: 'active' })
  @IsOptional()
  @IsEnum(['active', 'paused', 'resolved'])
  status?: string;

  @ApiPropertyOptional({ enum: ['low', 'medium', 'high'], example: 'medium' })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: string;

  @ApiPropertyOptional({ example: 'Cliente solicita seguimiento por WhatsApp' })
  @IsOptional()
  @IsString()
  notes?: string;
}
