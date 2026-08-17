import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VoiceService } from '../voice/voice.service';

@ApiTags('Calls - Llamadas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('calls')
export class CallsController {
  constructor(private voiceService: VoiceService) {}

  @Get()
  @ApiOperation({ summary: 'Listar llamadas', description: 'Devuelve llamadas del tenant, opcionalmente filtradas por conversation_id.' })
  @ApiQuery({ name: 'conversation_id', required: false })
  async getCalls(@Query('conversation_id') conversationId?: string) {
    const calls = await this.voiceService.findAll(conversationId);
    return { calls };
  }
}
