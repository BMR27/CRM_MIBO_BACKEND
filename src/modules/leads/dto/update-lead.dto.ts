import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLeadDto {
  @ApiPropertyOptional({ enum: ['new', 'contacted', 'converted', 'discarded'] })
  @IsOptional()
  @IsIn(['new', 'contacted', 'converted', 'discarded'])
  status?: 'new' | 'contacted' | 'converted' | 'discarded';
}
