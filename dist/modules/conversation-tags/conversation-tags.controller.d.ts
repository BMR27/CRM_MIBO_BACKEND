import { ConversationTagsService } from './conversation-tags.service';
import { CreateConversationTagDto } from './dto/create-conversation-tag.dto';
export declare class ConversationTagsController {
    private readonly conversationTagsService;
    constructor(conversationTagsService: ConversationTagsService);
    create(createTagDto: CreateConversationTagDto): Promise<CreateConversationTagDto & import("./entities/conversation-tag.entity").ConversationTag>;
    findAll(): Promise<import("./entities/conversation-tag.entity").ConversationTag[]>;
    findOne(id: string): Promise<import("./entities/conversation-tag.entity").ConversationTag>;
    findByConversation(conversationId: string): Promise<import("./entities/conversation-tag.entity").ConversationTag[]>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=conversation-tags.controller.d.ts.map