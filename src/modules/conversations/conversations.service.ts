import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    private messagesService: MessagesService,
  ) {}

  async getMessagesByConversation(conversationId: string) {
    // Usar el servicio inyectado para obtener los mensajes correctamente ordenados y con media_proxy_url
    return await this.messagesService.findByConversation(conversationId);
  }

  async create(createConversationDto: CreateConversationDto) {
    const conversation = this.conversationRepository.create(createConversationDto as any);
    return this.conversationRepository.save(conversation);
  }

  async findAll() {
    const conversations = await this.conversationRepository.find({
      relations: ['contact', 'assigned_agent', 'messages'],
    });
    // Agregar campo last_message y unread_count
    return conversations.map(conv => {
      let lastMsg = null;
      let unreadCount = 0;
      if (conv.messages && conv.messages.length > 0) {
        // Ordenar por fecha si no está ordenado
        const sorted = [...conv.messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        lastMsg = sorted[0].content;
        // Contar mensajes no leídos de tipo 'contact'
        unreadCount = conv.messages.filter(m => m.is_read === false && m.sender_type === 'contact').length;
      }
      return {
        ...conv,
        last_message: lastMsg,
        unread_count: unreadCount,
      };
    });
  }

  async findOne(id: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['contact', 'assigned_agent', 'messages'],
    });
    if (!conversation) {
      throw new (require('@nestjs/common').NotFoundException)('Conversation not found');
    }
    // Mapeo explícito para frontend
    return {
      id: conversation.id,
      priority: conversation.priority,
      status: conversation.status,
      contact: conversation.contact,
      assigned_agent: conversation.assigned_agent,
      messages: conversation.messages,
      updated_at: conversation.updated_at,
      created_at: conversation.created_at,
    };
  }

  async findByContact(contactId: string) {
    return this.conversationRepository.find({
      where: { contact_id: contactId },
      relations: ['assigned_agent'],
    });
  }

  async findByAssignedAgent(agentId: string) {
    return this.conversationRepository.find({
      where: { assigned_agent_id: agentId },
      relations: ['contact', 'assigned_agent', 'messages'],
      order: { updated_at: 'DESC' },
    });
  }

  async assignAgent(conversationId: string, agentId: string) {
    await this.conversationRepository.update(conversationId, {
      assigned_agent_id: agentId,
    });
    return this.findOne(conversationId);
  }

  async update(id: string, updateConversationDto: UpdateConversationDto) {
    const updateData = this.conversationRepository.create(updateConversationDto as any);
    await this.conversationRepository.update(id, updateData as any);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.conversationRepository.delete(id);
    return { success: true };
  }
}
