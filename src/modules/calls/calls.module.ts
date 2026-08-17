import { Module } from '@nestjs/common';
import { CallsController } from './calls.controller';
import { VoiceModule } from '../voice/voice.module';

@Module({
  imports: [VoiceModule],
  controllers: [CallsController],
})
export class CallsModule {}
