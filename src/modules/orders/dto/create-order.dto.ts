import { IsUUID, IsEnum, IsOptional, IsString, IsNumber, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 'ORD-123456' })
  @IsString()
  order_number: string;

  @ApiProperty({ example: 'uuid-contacto' })
  @IsUUID()
  contact_id: string;

  @ApiPropertyOptional({ enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], example: 'pending' })
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
  status?: string;

  @ApiPropertyOptional({ example: 1299.99 })
  @IsOptional()
  @IsNumber()
  total_amount?: number;

  @ApiPropertyOptional({ type: 'array', items: { type: 'object' }, example: [{ sku: 'SKU-1', name: 'Producto', quantity: 1 }] })
  @IsOptional()
  @IsArray()
  items?: any[];

  @ApiPropertyOptional({ example: 'Calle 1, Colonia Centro, CDMX' })
  @IsOptional()
  @IsString()
  shipping_address?: string;

  @ApiPropertyOptional({ example: 'TRK123456' })
  @IsOptional()
  @IsString()
  tracking_number?: string;

  @ApiPropertyOptional({ example: 'Entrega prioritaria' })
  @IsOptional()
  @IsString()
  notes?: string;
}
