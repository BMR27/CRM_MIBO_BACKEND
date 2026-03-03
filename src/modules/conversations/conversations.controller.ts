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
import { ContactsService } from '../contacts/contacts.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
    private readonly contactsService: ContactsService,
    private readonly whatsappService: WhatsappService,
  ) {
    this.logger = new (require('@nestjs/common').Logger)(ConversationsController.name);
  }
  private readonly logger;

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
  async findAll(@Req() request: any) {
    const user = request.user;
    const userRole = user?.role;
    let conversations = [];
    if (userRole === 'agent') {
      conversations = await this.conversationsService.findByAssignedAgent(user.id);
    } else {
      conversations = await this.conversationsService.findAll();
    }
    // Asegura que unread_count esté presente en la respuesta
    return { conversations: conversations.map(conv => ({
      ...conv,
      unread_count: conv.unread_count ?? 0,
    })) };
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
      // ...existing code...
      const conversation = await this.conversationsService.findOne(conversationId);
      if (!conversation) {
        return {
          success: false,
          error: 'La conversación no existe',
        };
      }
      if (!body.content) {
        return {
          success: false,
          error: 'El campo content es obligatorio',
        };
      }
      // ...existing code...
      // Asignar el sender_type según el rol real del usuario
      let senderType = 'user';
      if (req.user?.role === 'admin') senderType = 'admin';
      else if (req.user?.role === 'supervisor') senderType = 'supervisor';
      else if (req.user?.role === 'agent' || req.user?.isAgent) senderType = 'agent';
      const createMessageDto: CreateMessageDto = {
        ...body,
        conversation_id: conversationId,
        sender_type: senderType,
        sender_id: body.sender_id || req.user?.id,
        content: body.content,
        message_type: body.message_type || 'text',
      };
      const result = await this.messagesService.create(createMessageDto);
      // ...existing code...
      if (conversation.channel === 'whatsapp' && createMessageDto.sender_type === 'agent') {
        try {
          const contact = conversation.contact || (await this.contactsService.findOne(conversation.contact_id));
          if (contact && contact.phone_number) {
            const sendResult = await this.whatsappService.sendMessage(contact.phone_number, createMessageDto.content);
            if (sendResult && sendResult.success === false) {
              this.logger.error('[WhatsApp] Error al enviar mensaje:', sendResult.error, sendResult);
              return {
                success: false,
                error: sendResult.error || 'Error enviando mensaje a WhatsApp',
                hint: sendResult.hint,
                error_code: sendResult.error_code,
                message: result,
              };
            } else {
              this.logger.log('[WhatsApp] Mensaje enviado correctamente:', sendResult.whatsapp_message_id);
            }
          }
        } catch (sendError) {
          this.logger.error('[WhatsApp] Excepción al enviar mensaje:', sendError);
          return {
            success: false,
            error: sendError?.message || 'Error enviando mensaje a WhatsApp',
            message: result,
          };
        }
      }
      return {
        success: true,
        message: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error?.message || 'Error inesperado',
      };
    }
  }
}


