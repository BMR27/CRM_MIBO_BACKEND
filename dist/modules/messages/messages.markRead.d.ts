import { Message } from './entities/message.entity';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
export declare class MessagesMarkReadService {
    private messageRepository;
    constructor(messageRepository: TenantScopedRepository<Message>);
    markConversationMessagesAsRead(conversationId: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=messages.markRead.d.ts.map