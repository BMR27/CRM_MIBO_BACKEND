import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationTag } from './entities/conversation-tag.entity';
import { ConversationTagsService } from './conversation-tags.service';
import { ConversationTagsController } from './conversation-tags.controller';
import { CONVERSATION_TAG_REPO } from './conversation-tags.tokens';
import { tenantScopedRepositoryProvider } from '../../common/tenant/tenant-scoped-repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([ConversationTag])],
  providers: [
    ConversationTagsService,
    tenantScopedRepositoryProvider(CONVERSATION_TAG_REPO, ConversationTag),
  ],
  controllers: [ConversationTagsController],
  exports: [ConversationTagsService],
})
export class ConversationTagsModule {}
