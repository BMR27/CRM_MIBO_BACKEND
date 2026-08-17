import { ConversationTag } from './entities/conversation-tag.entity';
import { CreateConversationTagDto } from './dto/create-conversation-tag.dto';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
export declare class ConversationTagsService {
    private tagRepository;
    constructor(tagRepository: TenantScopedRepository<ConversationTag>);
    create(createTagDto: CreateConversationTagDto): Promise<ConversationTag>;
    findAll(): Promise<ConversationTag[]>;
    findOne(id: string): Promise<ConversationTag>;
    findByConversation(conversationId: string): Promise<ConversationTag[]>;
    remove(id: string): Promise<void>;
    removeByConversation(conversationId: string): Promise<void>;
}
//# sourceMappingURL=conversation-tags.service.d.ts.map