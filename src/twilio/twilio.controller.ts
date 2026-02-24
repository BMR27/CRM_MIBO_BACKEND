import { Query } from '@nestjs/common';
  /**
   * Endpoint para obtener plantillas aprobadas de WhatsApp en Twilio
   * GET /api/twilio/wa-templates?serviceSid=MGxxxx
   */
  @Post('wa-templates')
  async getApprovedWATemplates(@Body('serviceSid') serviceSid: string) {
    if (!serviceSid) return { error: 'serviceSid requerido' };
    return this.twilioService.listApprovedWATemplates(serviceSid);
  }
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
