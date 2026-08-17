import { Module, forwardRef } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { TwilioController } from './twilio.controller';
import { MessagesModule } from '../modules/messages/messages.module';
import { WhatsappModule } from '../modules/whatsapp/whatsapp.module';

@Module({
  imports: [forwardRef(() => MessagesModule), forwardRef(() => WhatsappModule)],
  providers: [TwilioService],
  controllers: [TwilioController],
  exports: [TwilioService],
})
export class TwilioModule {}
