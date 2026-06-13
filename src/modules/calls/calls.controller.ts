import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Calls - Llamadas')
@Controller('calls')
export class CallsController {
  @Get()
  @ApiOperation({ summary: 'Listar llamadas', description: 'Devuelve llamadas asociadas a una conversación cuando se envía conversation_id.' })
  @ApiQuery({ name: 'conversation_id', required: false, description: 'ID de la conversación' })
  async getCalls(@Query('conversation_id') conversationId: string) {
    // Aquí deberías consultar la base de datos por las llamadas asociadas
    // Por ahora, devuelve un array vacío para evitar el error 404
    return { calls: [] };
  }
}
