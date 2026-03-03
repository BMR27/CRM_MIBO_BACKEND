import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessagesMarkReadService } from './messages.markRead';
export declare class MessagesController {
    private readonly messagesService;
    private readonly messagesMarkReadService;
    constructor(messagesService: MessagesService, messagesMarkReadService: MessagesMarkReadService);
    create(createMessageDto: CreateMessageDto): Promise<any[]>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    findByConversation(conversationId: string): Promise<any[]>;
    update(id: string, updateMessageDto: UpdateMessageDto): Promise<any>;
    remove(id: string): Promise<void>;
    markConversationMessagesAsRead(conversationId: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=messages.controller.d.ts.map