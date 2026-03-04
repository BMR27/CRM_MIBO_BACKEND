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
    findOne(id: string): Promise<{
        id: string;
        priority: "low" | "medium" | "high";
        status: "active" | "paused" | "resolved";
        contact: import("../contacts/entities/contact.entity").Contact;
        assigned_agent: import("../users/entities/user.entity").User;
        messages: import("../messages/entities/message.entity").Message[];
        updated_at: Date;
        created_at: Date;
    }>;
    findByContact(contactId: string): Promise<import("./entities/conversation.entity").Conversation[]>;
    update(id: string, updateConversationDto: UpdateConversationDto): Promise<{
        id: string;
        priority: "low" | "medium" | "high";
        status: "active" | "paused" | "resolved";
        contact: import("../contacts/entities/contact.entity").Contact;
        assigned_agent: import("../users/entities/user.entity").User;
        messages: import("../messages/entities/message.entity").Message[];
        updated_at: Date;
        created_at: Date;
    }>;
    assignAgent(id: string, body: {
        agentId: string;
    }): Promise<{
        id: string;
        assigned_agent_id: string;
        message: string;
    }>;
    updatePriority(id: string, body: {
        priority: string;
    }): Promise<{
        id: string;
        priority: string;
        message: string;
    }>;
    updateStatus(id: string, body: {
        status: string;
    }): Promise<{
        id: string;
        status: string;
        message: string;
    }>;
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