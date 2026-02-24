import { Body, Controller, Post } from '@nestjs/common';
import { TwilioService } from './twilio.service';

@Controller('api/twilio')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  @Post('send-wa-template')
  async sendWATemplate(@Body() body: any) {
    // body: { to, from, templateSid, variables }
    return this.twilioService.sendWhatsAppTemplate(body);
  }
}
