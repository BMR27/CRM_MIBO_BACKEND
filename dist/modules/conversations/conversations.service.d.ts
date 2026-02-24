import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
export declare class ConversationsService {
    private conversationRepository;
    constructor(conversationRepository: Repository<Conversation>);
    create(createConversationDto: CreateConversationDto): Promise<Conversation[]>;
    findAll(): Promise<Conversation[]>;
    findOne(id: string): Promise<Conversation>;
    findByContact(contactId: string): Promise<Conversation[]>;
    findByAssignedAgent(agentId: string): Promise<Conversation[]>;
    assignAgent(conversationId: string, agentId: string): Promise<Conversation>;
    update(id: string, updateConversationDto: UpdateConversationDto): Promise<Conversation>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=conversations.service.d.ts.map