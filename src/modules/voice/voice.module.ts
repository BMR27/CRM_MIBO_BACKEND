import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoiceService } from './voice.service';
import { VoiceController } from './voice.controller';
import { VoiceIntegrationsService } from './voice-integrations.service';
import { VoiceIntegration } from './entities/voice-integration.entity';
import { Call } from './entities/call.entity';
import { VOICE_INTEGRATION_REPO, CALL_REPO } from './voice.tokens';
import { tenantScopedRepositoryProvider } from '../../common/tenant/tenant-scoped-repository.provider';
import { ContactsModule } from '../contacts/contacts.module';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  imports: [TypeOrmModule.forFeature([VoiceIntegration, Call]), ContactsModule, ConversationsModule],
  providers: [
    VoiceService,
    VoiceIntegrationsService,
    tenantScopedRepositoryProvider(VOICE_INTEGRATION_REPO, VoiceIntegration),
    tenantScopedRepositoryProvider(CALL_REPO, Call),
  ],
  controllers: [VoiceController],
  exports: [VoiceService, VoiceIntegrationsService],
})
export class VoiceModule {}
