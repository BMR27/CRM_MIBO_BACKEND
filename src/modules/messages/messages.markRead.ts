import { Inject, Injectable } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
import { MESSAGE_REPO } from './messages.tokens';

@Injectable()
export class MessagesMarkReadService {
  constructor(
    @Inject(MESSAGE_REPO)
    private messageRepository: TenantScopedRepository<Message>,
  ) {}

  async markConversationMessagesAsRead(conversationId: string) {
    await this.messageRepository.updateBy(
      { conversation_id: conversationId, is_read: false } as any,
      { is_read: true, read_at: new Date() } as any,
    );
    return { success: true };
  }
}
