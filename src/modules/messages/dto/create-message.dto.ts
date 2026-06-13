import {
  IsUUID,
  IsEnum,
  IsString,
  IsBoolean,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ example: 'uuid-conversacion' })
  @IsUUID()
  conversation_id: string;

  @ApiProperty({ enum: ['user', 'contact', 'agent'], example: 'agent' })
  @IsEnum(['user', 'contact'])
  sender_type: string;

  @ApiPropertyOptional({ example: 'uuid-usuario' })
  @IsOptional()
  @IsUUID()
  sender_id?: string;

  @ApiProperty({ example: 'Hola, gracias por contactarnos.' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ enum: ['text', 'image', 'document', 'audio', 'video', 'sticker'], example: 'text' })
  @IsOptional()
  @IsEnum(['text', 'image', 'document', 'audio', 'video', 'sticker'])
  message_type?: string;

  @ApiPropertyOptional({ example: 'MEaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' })
  @IsOptional()
  @IsString()
  media_id?: string;

  @ApiPropertyOptional({ example: 'application/pdf' })
  @IsOptional()
  @IsString()
  media_mime_type?: string;

  @ApiPropertyOptional({ example: 'sha256-hash' })
  @IsOptional()
  @IsString()
  media_sha256?: string;

  @ApiPropertyOptional({ example: 'archivo.pdf' })
  @IsOptional()
  @IsString()
  media_filename?: string;

  @ApiPropertyOptional({ example: 'Adjunto comprobante' })
  @IsOptional()
  @IsString()
  media_caption?: string;

  @ApiPropertyOptional({ example: 'https://example.com/archivo.pdf' })
  @IsOptional()
  @IsString()
  media_url?: string;

  @ApiPropertyOptional({
    type: 'object',
    example: { campaignId: 'bulk_1710000000000', source: 'bulk' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ example: '2026-06-12T15:00:00.000Z' })
  @IsOptional()
  created_at?: Date;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_from_whatsapp?: boolean;

  @ApiPropertyOptional({ example: 'SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' })
  @IsOptional()
  @IsString()
  whatsapp_message_id?: string;
}
