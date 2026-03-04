import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { MessagesMarkReadService } from './messages.markRead';
import { MessagesBulkController } from './messages.bulk.controller';
import { forwardRef } from '@nestjs/common';
import { TwilioModule } from '../../twilio/twilio.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), forwardRef(() => TwilioModule)],
  providers: [MessagesService, MessagesMarkReadService],
  controllers: [MessagesController, MessagesBulkController],
  exports: [MessagesService],
})
export class MessagesModule {}
