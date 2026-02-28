import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { MessagesService } from '../messages/messages.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
export declare class ConversationsController {
    private readonly conversationsService;
    private readonly messagesService;
    constructor(conversationsService: ConversationsService, messagesService: MessagesService);
    getMessages(id: string): Promise<import("../messages/entities/message.entity").Message[]>;
    create(createConversationDto: CreateConversationDto): Promise<{
        conversation: import("./entities/conversation.entity").Conversation[];
    }>;
    findAll(request: any): Promise<import("./entities/conversation.entity").Conversation[]>;
    findOne(id: string): Promise<import("./entities/conversation.entity").Conversation>;
    findByContact(contactId: string): Promise<import("./entities/conversation.entity").Conversation[]>;
    update(id: string, updateConversationDto: UpdateConversationDto): Promise<import("./entities/conversation.entity").Conversation>;
    assignAgent(id: string, body: {
        agent_id: string;
    }): Promise<import("./entities/conversation.entity").Conversation>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    createMessageForConversation(conversationId: string, body: Partial<CreateMessageDto>, req: any): Promise<any[]>;
}
//# sourceMappingURL=conversations.controller.d.ts.map