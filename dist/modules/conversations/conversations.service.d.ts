import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
export declare class ConversationsService {
    private conversationRepository;
    constructor(conversationRepository: Repository<Conversation>);
    getMessagesByConversation(conversationId: string): Promise<import("../messages/entities/message.entity").Message[]>;
    create(createConversationDto: CreateConversationDto): Promise<Conversation[]>;
    findAll(): Promise<{
        last_message: any;
        id: string;
        contact_id: string;
        assigned_agent_id: string;
        status: "active" | "paused" | "resolved";
        priority: "low" | "medium" | "high";
        notes: string;
        last_message_at: Date;
        created_at: Date;
        updated_at: Date;
        contact: import("../contacts/entities/contact.entity").Contact;
        assigned_agent: import("../users/entities/user.entity").User;
        messages: import("../messages/entities/message.entity").Message[];
        tags: import("../conversation-tags/entities/conversation-tag.entity").ConversationTag[];
    }[]>;
    findOne(id: string): Promise<Conversation>;
    findByContact(contactId: string): Promise<Conversation[]>;
    findByAssignedAgent(agentId: string): Promise<Conversation[]>;
    assignAgent(conversationId: string, agentId: string): Promise<Conversation>;
    update(id: string, updateConversationDto: UpdateConversationDto): Promise<Conversation>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=conversations.service.d.ts.map