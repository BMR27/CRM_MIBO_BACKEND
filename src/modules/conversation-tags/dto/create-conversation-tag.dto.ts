import { IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationTagDto {
  @ApiProperty({ example: 'uuid-conversacion' })
  @IsUUID()
  conversation_id: string;

  @ApiProperty({ example: 'seguimiento' })
  @IsString()
  tag: string;
}
