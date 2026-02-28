
import { Body, Controller, Post, Options } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { MessagesService } from '../modules/messages/messages.service';


@Controller('twilio')
export class TwilioController {
  constructor(
    private readonly twilioService: TwilioService,
    private readonly messagesService: MessagesService,
  ) {}

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
    // body: { to, from, contentSid, variables, conversation_id, sender_id }
    let twilioResult;
    if (body.contentSid) {
      twilioResult = await this.twilioService.sendWhatsAppTemplateViaHttp(body);
    } else {
      twilioResult = await this.twilioService.sendWhatsAppTemplate(body);
    }

    // Registrar mensaje en la conversación si se provee conversation_id
    if (body.conversation_id) {
      // Obtener el texto real enviado por Twilio
      let sentText = '';
      if (twilioResult && twilioResult.body) {
        sentText = twilioResult.body;
      } else if (twilioResult && twilioResult.message && twilioResult.message.body) {
        sentText = twilioResult.message.body;
      } else {
        sentText = body.variables && body.variables.length > 0 ? body.variables[0] : 'Plantilla enviada';
      }
      await this.messagesService.create({
        conversation_id: body.conversation_id,
        sender_type: 'agent',
        sender_id: body.sender_id || null,
        content: sentText,
        message_type: 'text',
        is_from_whatsapp: true,
        metadata: { twilio: twilioResult },
      });
    }
    return { success: true, twilio: twilioResult };
  }

  @Options('send-wa-template')
  optionsSendWaTemplate() {
    return {};
  }
}
