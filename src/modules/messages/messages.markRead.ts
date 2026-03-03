import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesMarkReadService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async markConversationMessagesAsRead(conversationId: string) {
    await this.messageRepository.update(
      { conversation_id: conversationId, is_read: false },
      { is_read: true, read_at: new Date() }
    );
    return { success: true };
  }
}
