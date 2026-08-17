import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacebookService } from './facebook.service';
import { FacebookController } from './facebook.controller';
import { FacebookIntegrationsService } from './facebook-integrations.service';
import { FacebookIntegration } from './entities/facebook-integration.entity';
import { FACEBOOK_INTEGRATION_REPO } from './facebook.tokens';
import { tenantScopedRepositoryProvider } from '../../common/tenant/tenant-scoped-repository.provider';
import { ContactsModule } from '../contacts/contacts.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FacebookIntegration]),
    ContactsModule,
    forwardRef(() => ConversationsModule),
    MessagesModule,
  ],
  providers: [
    FacebookService,
    FacebookIntegrationsService,
    tenantScopedRepositoryProvider(FACEBOOK_INTEGRATION_REPO, FacebookIntegration),
  ],
  controllers: [FacebookController],
  exports: [FacebookService, FacebookIntegrationsService],
})
export class FacebookModule {}
