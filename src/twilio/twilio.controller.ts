
import { Body, Controller, Post } from '@nestjs/common';
import { TwilioService } from './twilio.service';

@Controller('twilio')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  /**
   * Endpoint para obtener plantillas aprobadas de WhatsApp en Twilio
   * POST /api/twilio/wa-templates { serviceSid }
   */
  @Post('wa-templates')
  async getApprovedWATemplates() {
    return this.twilioService.listApprovedWATemplates();
  }

  @Post('send-wa-template')
  async sendWATemplate(@Body() body: any) {
    // body: { to, from, contentSid, variables }
    return this.twilioService.sendWhatsAppTemplate(body);
  }
}
