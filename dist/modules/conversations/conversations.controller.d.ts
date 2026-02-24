import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
export declare class ConversationsController {
    private readonly conversationsService;
    constructor(conversationsService: ConversationsService);
    create(createConversationDto: CreateConversationDto): Promise<import("./entities/conversation.entity").Conversation[]>;
    findAll(request: any): Promise<import("./entities/conversation.entity").Conversation[]>;
    findOne(id: string): Promise<import("./entities/conversation.entity").Conversation>;
    findByContact(contactId: string): Promise<import("./entities/conversation.entity").Conversation[]>;
    update(id: string, updateConversationDto: UpdateConversationDto): Promise<import("./entities/conversation.entity").Conversation>;
    assignAgent(id: string, body: {
        agent_id: string;
    }): Promise<import("./entities/conversation.entity").Conversation>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=conversations.controller.d.ts.map