import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { MessagesService } from '../messages/messages.service';
export declare class ConversationsService {
    private conversationRepository;
    private messagesService;
    constructor(conversationRepository: Repository<Conversation>, messagesService: MessagesService);
    getMessagesByConversation(conversationId: string): Promise<any[]>;
    create(createConversationDto: CreateConversationDto): Promise<Conversation[]>;
    findAll(): Promise<{
        last_message: any;
        unread_count: number;
        channel: string;
        id: string;
        contact_id: string;
        assigned_agent_id: string;
        status: "active" | "paused" | "resolved";
        priority: "low" | "medium" | "high";
        notes: string;
        external_user_id: string;
        last_message_at: Date;
        created_at: Date;
        updated_at: Date;
        contact: import("../contacts/entities/contact.entity").Contact;
        assigned_agent: import("../users/entities/user.entity").User;
        messages: import("../messages/entities/message.entity").Message[];
        tags: import("../conversation-tags/entities/conversation-tag.entity").ConversationTag[];
    }[]>;
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
    findByContact(contactId: string): Promise<Conversation[]>;
    findByAssignedAgent(agentId: string): Promise<Conversation[]>;
    assignAgent(conversationId: string, agentId: string): Promise<{
        id: string;
        priority: "low" | "medium" | "high";
        status: "active" | "paused" | "resolved";
        contact: import("../contacts/entities/contact.entity").Contact;
        assigned_agent: import("../users/entities/user.entity").User;
        messages: import("../messages/entities/message.entity").Message[];
        updated_at: Date;
        created_at: Date;
    }>;
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
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=conversations.service.d.ts.map