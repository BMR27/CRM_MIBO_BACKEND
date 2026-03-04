import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesMarkReadService } from './messages.markRead';
import { MessagesBulkController } from './messages.bulk.controller';
// ...existing code...
import { TwilioModule } from '../../twilio/twilio.module';
import { forwardRef } from '@nestjs/common';
import { ContactsModule } from '../contacts/contacts.module';
import { ConversationsModule } from '../conversations/conversations.module';
// ...existing code...

@Module({
  imports: [TypeOrmModule.forFeature([Message]), forwardRef(() => TwilioModule), forwardRef(() => ContactsModule), forwardRef(() => ConversationsModule)],
  providers: [MessagesService, MessagesMarkReadService],
  controllers: [MessagesController, MessagesBulkController],
  exports: [MessagesService],
})
export class MessagesModule {}
