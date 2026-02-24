
import { Body, Controller, Post } from '@nestjs/common';
import { TwilioService } from './twilio.service';

@Controller('api/twilio')
export class TwilioController {
  constructor(private readonly twilioService: TwilioService) {}

  /**
   * Endpoint para obtener plantillas aprobadas de WhatsApp en Twilio
   * POST /api/twilio/wa-templates { serviceSid }
   */
  @Post('wa-templates')
  async getApprovedWATemplates(@Body('serviceSid') serviceSid: string) {
    if (!serviceSid) return { error: 'serviceSid requerido' };
    return this.twilioService.listApprovedWATemplates(serviceSid);
  }

  @Post('send-wa-template')
  async sendWATemplate(@Body() body: any) {
    // body: { to, from, templateSid, variables }
    return this.twilioService.sendWhatsAppTemplate(body);
  }
}
