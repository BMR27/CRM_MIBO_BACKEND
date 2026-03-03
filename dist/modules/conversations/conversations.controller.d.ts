import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { MessagesService } from '../messages/messages.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { ContactsService } from '../contacts/contacts.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
export declare class ConversationsController {
    private readonly conversationsService;
    private readonly messagesService;
    private readonly contactsService;
    private readonly whatsappService;
    constructor(conversationsService: ConversationsService, messagesService: MessagesService, contactsService: ContactsService, whatsappService: WhatsappService);
    private readonly logger;
    getMessages(id: string): Promise<any[]>;
    create(createConversationDto: CreateConversationDto): Promise<{
        conversation: import("./entities/conversation.entity").Conversation[];
    }>;
    findAll(request: any): Promise<{
        conversations: any[];
    }>;
    findOne(id: string): Promise<import("./entities/conversation.entity").Conversation>;
    findByContact(contactId: string): Promise<import("./entities/conversation.entity").Conversation[]>;
    update(id: string, updateConversationDto: UpdateConversationDto): Promise<import("./entities/conversation.entity").Conversation>;
    assignAgent(id: string, body: {
        agent_id: string;
    }): Promise<import("./entities/conversation.entity").Conversation>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    createMessageForConversation(conversationId: string, body: Partial<CreateMessageDto>, req: any): Promise<{
        success: boolean;
        error: string;
        hint: string;
        error_code: number;
        message: any[];
    } | {
        success: boolean;
        error: any;
        message: any[];
        hint?: undefined;
        error_code?: undefined;
    } | {
        success: boolean;
        message: any[];
        error?: undefined;
        hint?: undefined;
        error_code?: undefined;
    } | {
        success: boolean;
        error: any;
        hint?: undefined;
        error_code?: undefined;
        message?: undefined;
    }>;
}
//# sourceMappingURL=conversations.controller.d.ts.map