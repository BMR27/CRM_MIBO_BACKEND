import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
export declare class MessagesMarkReadService {
    private messageRepository;
    constructor(messageRepository: Repository<Message>);
    markConversationMessagesAsRead(conversationId: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=messages.markRead.d.ts.map