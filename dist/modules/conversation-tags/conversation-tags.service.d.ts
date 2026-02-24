import { Repository } from 'typeorm';
import { ConversationTag } from './entities/conversation-tag.entity';
import { CreateConversationTagDto } from './dto/create-conversation-tag.dto';
export declare class ConversationTagsService {
    private tagRepository;
    constructor(tagRepository: Repository<ConversationTag>);
    create(createTagDto: CreateConversationTagDto): Promise<CreateConversationTagDto & ConversationTag>;
    findAll(): Promise<ConversationTag[]>;
    findOne(id: string): Promise<ConversationTag>;
    findByConversation(conversationId: string): Promise<ConversationTag[]>;
    remove(id: string): Promise<void>;
    removeByConversation(conversationId: string): Promise<void>;
}
//# sourceMappingURL=conversation-tags.service.d.ts.map