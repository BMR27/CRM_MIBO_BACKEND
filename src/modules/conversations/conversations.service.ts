
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  async getMessagesByConversation(conversationId: string) {
    const conv = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['messages'],
    });
    return conv?.messages || [];
  }

  async create(createConversationDto: CreateConversationDto) {
    const conversation = this.conversationRepository.create(createConversationDto as any);
    return this.conversationRepository.save(conversation);
  }

  async findAll() {
    const conversations = await this.conversationRepository.find({
      relations: ['contact', 'assigned_agent', 'messages'],
    });
    // Agregar campo last_message con el contenido del último mensaje
    return conversations.map(conv => {
      let lastMsg = null;
      if (conv.messages && conv.messages.length > 0) {
        // Ordenar por fecha si no está ordenado
        const sorted = [...conv.messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        lastMsg = sorted[0].content;
      }
      return {
        ...conv,
        last_message: lastMsg,
      };
    });
  }

  async findOne(id: string) {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: ['contact', 'assigned_agent', 'messages'],
    });
    if (!conversation) {
      // Usar NotFoundException para que el backend retorne 404
      // y el frontend pueda manejarlo correctamente
      // Importar NotFoundException si no está
      // import { NotFoundException } from '@nestjs/common';
      throw new (require('@nestjs/common').NotFoundException)('Conversation not found');
    }
    return conversation;
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
