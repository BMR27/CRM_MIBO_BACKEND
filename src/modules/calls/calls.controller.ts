import { Controller, Get, Query } from '@nestjs/common';

@Controller('calls')
export class CallsController {
  @Get()
  async getCalls(@Query('conversation_id') conversationId: string) {
    // Aquí deberías consultar la base de datos por las llamadas asociadas
    // Por ahora, devuelve un array vacío para evitar el error 404
    return { calls: [] };
  }
}
