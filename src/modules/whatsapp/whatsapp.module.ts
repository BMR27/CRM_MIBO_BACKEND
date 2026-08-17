import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappIntegrationsService } from './whatsapp-integrations.service';
import { WhatsappIntegration } from './entities/whatsapp-integration.entity';
import { WHATSAPP_INTEGRATION_REPO } from './whatsapp.tokens';
import { tenantScopedRepositoryProvider } from '../../common/tenant/tenant-scoped-repository.provider';
import { ContactsModule } from '../contacts/contacts.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsappIntegration]),
    ContactsModule,
    forwardRef(() => ConversationsModule),
    forwardRef(() => MessagesModule),
  ],
  providers: [
    WhatsappService,
    WhatsappIntegrationsService,
    tenantScopedRepositoryProvider(WHATSAPP_INTEGRATION_REPO, WhatsappIntegration),
  ],
  controllers: [WhatsappController],
  exports: [WhatsappService, WhatsappIntegrationsService],
})
export class WhatsappModule {}
