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
  Req,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../decorators/roles.decorator';
import { MessagesService } from '../messages/messages.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
  ) {}

  @Get(':id/messages')
  @UseGuards(JwtAuthGuard)
  async getMessages(@Param('id') id: string) {
    return this.conversationsService.getMessagesByConversation(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body(ValidationPipe) createConversationDto: CreateConversationDto) {
    return this.conversationsService.create(createConversationDto).then(conversation => ({ conversation }));
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() request: any) {
    const user = request.user;
    const userRole = user?.role;
    if (userRole === 'agent') {
      return this.conversationsService.findByAssignedAgent(user.id);
    }
    return this.conversationsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.conversationsService.findOne(id);
  }

  @Get('contact/:contactId')
  @UseGuards(JwtAuthGuard)
  findByContact(@Param('contactId') contactId: string) {
    return this.conversationsService.findByContact(contactId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationsService.update(id, updateConversationDto);
  }

  @Post(':id/assign')
  @UseGuards(JwtAuthGuard)
  assignAgent(
    @Param('id') id: string,
    @Body() body: { agent_id: string },
  ) {
    return this.conversationsService.assignAgent(id, body.agent_id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.conversationsService.remove(id);
  }

  @Post(':id/messages')
  @UseGuards(JwtAuthGuard)
  async createMessageForConversation(
    @Param('id') conversationId: string,
    @Body(ValidationPipe) body: Partial<CreateMessageDto>,
    @Req() req: any,
  ) {
    try {
      console.log('[createMessageForConversation] conversationId:', conversationId)
      console.log('[createMessageForConversation] body:', body)
      console.log('[createMessageForConversation] req.user:', req.user)
      // Validar existencia de conversación
      const conversation = await this.conversationsService.findOne(conversationId);
      if (!conversation) {
        console.error('[createMessageForConversation] No existe la conversación:', conversationId);
        throw new Error('La conversación no existe');
      }
      if (!body.content) {
        throw new Error('El campo content es obligatorio')
      }
      // Si el usuario autenticado es un agente, asignar sender_type 'agent'
      const isAgent = req.user?.role === 'agent' || req.user?.isAgent
      const createMessageDto: CreateMessageDto = {
        ...body,
        conversation_id: conversationId,
        sender_type: isAgent ? 'agent' : (body.sender_type || 'user'),
        sender_id: body.sender_id || req.user?.id,
        content: body.content,
        message_type: body.message_type || 'text',
      };
      const result = await this.messagesService.create(createMessageDto);
      console.log('[createMessageForConversation] Mensaje creado:', result)
      return result;
    } catch (error) {
      console.error('[createMessageForConversation] Error:', error);
      throw error;
    }
  }
}


