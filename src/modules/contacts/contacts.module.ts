import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { CONTACT_REPO } from './contacts.tokens';
import { tenantScopedRepositoryProvider } from '../../common/tenant/tenant-scoped-repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Contact])],
  providers: [ContactsService, tenantScopedRepositoryProvider(CONTACT_REPO, Contact)],
  controllers: [ContactsController],
  exports: [ContactsService],
})
export class ContactsModule {}
