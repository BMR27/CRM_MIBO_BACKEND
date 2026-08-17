import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessagesMarkReadService } from './messages.markRead';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Messages - Mensajes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly messagesMarkReadService: MessagesMarkReadService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear mensaje' })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({ status: 201, description: 'Mensaje creado' })
  create(@Body(ValidationPipe) createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar mensajes' })
  findAll() {
    return this.messagesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener mensaje por ID' })
  @ApiParam({ name: 'id', description: 'ID del mensaje' })
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @Get('conversation/:conversationId')
  @ApiOperation({ summary: 'Listar mensajes por conversación' })
  @ApiParam({ name: 'conversationId', description: 'ID de la conversación' })
  findByConversation(@Param('conversationId') conversationId: string) {
    return this.messagesService.findByConversation(conversationId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar mensaje' })
  @ApiParam({ name: 'id', description: 'ID del mensaje' })
  @ApiBody({ type: UpdateMessageDto })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateMessageDto: UpdateMessageDto,
  ) {
    return this.messagesService.update(id, updateMessageDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar mensaje' })
  @ApiParam({ name: 'id', description: 'ID del mensaje' })
  remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  }

  @Post('mark-read/:conversationId')
  @ApiOperation({ summary: 'Marcar mensajes de una conversación como leídos' })
  @ApiParam({ name: 'conversationId', description: 'ID de la conversación' })
  async markConversationMessagesAsRead(@Param('conversationId') conversationId: string) {
    return this.messagesMarkReadService.markConversationMessagesAsRead(conversationId);
  }
}
