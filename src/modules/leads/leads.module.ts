import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { Lead } from './entities/lead.entity';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { LEAD_REPO } from './leads.tokens';
import { tenantScopedRepositoryProvider } from '../../common/tenant/tenant-scoped-repository.provider';
import { ApiKeysModule } from '../api-keys/api-keys.module';
import { ContactsModule } from '../contacts/contacts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead]),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    ApiKeysModule,
    ContactsModule,
  ],
  providers: [LeadsService, tenantScopedRepositoryProvider(LEAD_REPO, Lead)],
  controllers: [LeadsController],
  exports: [LeadsService],
})
export class LeadsModule {}
