import { Inject, Injectable } from '@nestjs/common';
import { ConversationTag } from './entities/conversation-tag.entity';
import { CreateConversationTagDto } from './dto/create-conversation-tag.dto';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
import { CONVERSATION_TAG_REPO } from './conversation-tags.tokens';

@Injectable()
export class ConversationTagsService {
  constructor(
    @Inject(CONVERSATION_TAG_REPO)
    private tagRepository: TenantScopedRepository<ConversationTag>,
  ) {}

  async create(createTagDto: CreateConversationTagDto) {
    const tag = this.tagRepository.create(createTagDto as any);
    return this.tagRepository.save(tag);
  }

  async findAll() {
    return this.tagRepository.find();
  }

  async findOne(id: string) {
    return this.tagRepository.findOne({
      where: { id },
    });
  }

  async findByConversation(conversationId: string) {
    return this.tagRepository.find({
      where: { conversation_id: conversationId },
    });
  }

  async remove(id: string) {
    await this.tagRepository.delete(id);
  }

  async removeByConversation(conversationId: string) {
    await this.tagRepository.deleteBy({ conversation_id: conversationId } as any);
  }
}
