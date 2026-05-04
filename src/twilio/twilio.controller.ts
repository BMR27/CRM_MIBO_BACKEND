
import { Body, Controller, Post, Options, Get, Param, Query, Res } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { MessagesService } from '../modules/messages/messages.service';
import { Response } from 'express';


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
  async getApprovedWATemplates(@Body() body: any) {
    try {
      // Si se recibe serviceSid, pásalo al servicio
      return await this.twilioService.listApprovedWATemplates(body?.serviceSid);
    } catch (err: any) {
      console.error('Error obteniendo plantillas Twilio:', err?.response?.data || err?.message || err);
      throw { statusCode: 500, message: err?.response?.data?.message || err?.message || 'Internal server error' };
    }
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

  @Post('send-wa-media')
  async sendWAMedia(@Body() body: any) {
    const to = String(body?.to || '').trim();
    const from = String(body?.from || process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886').trim();
    const mediaUrl = String(body?.mediaUrl || '').trim();
    const textBody = typeof body?.body === 'string' ? body.body : undefined;

    if (!to || !mediaUrl) {
      throw { statusCode: 400, message: 'to and mediaUrl are required' };
    }

    const twilioResult = await this.twilioService.sendWhatsAppMedia({
      to,
      from,
      mediaUrl,
      body: textBody,
    });

    return { success: true, twilio: twilioResult };
  }

  @Options('send-wa-template')
  optionsSendWaTemplate() {
    return {};
  }

  @Options('send-wa-media')
  optionsSendWaMedia() {
    return {};
  }

  @Get('media-by-message/:messageSid')
  async getMediaByMessage(
    @Param('messageSid') messageSid: string,
    @Query('filename') filename: string | undefined,
    @Res() res: Response,
  ) {
    try {
      const result = await this.twilioService.downloadFirstMediaByMessageSid(messageSid);
      const safeFilename = (filename || '').trim();

      res.setHeader('Content-Type', result.contentType || 'application/octet-stream');
      res.setHeader('Cache-Control', 'private, no-store');

      if (safeFilename) {
        res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
      } else if (result.contentDisposition) {
        res.setHeader('Content-Disposition', result.contentDisposition);
      }

      res.status(200).send(result.data);
    } catch (error: any) {
      res.status(404).json({
        error: 'Media not found for message',
        details: error?.message || 'Unknown error',
      });
    }
  }
}
