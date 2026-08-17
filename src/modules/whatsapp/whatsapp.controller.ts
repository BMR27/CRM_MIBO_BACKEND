import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Query,
  Param,
  Request,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpException,
  HttpStatus,
  UploadedFile,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappIntegrationsService } from './whatsapp-integrations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { TenantContext } from '../../common/tenant/tenant-context';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('WhatsApp - Twilio/Cloud Integration')
@Controller('whatsapp')
export class WhatsappController {
  constructor(
    private whatsappService: WhatsappService,
    private integrationsService: WhatsappIntegrationsService,
  ) {}

  /**
   * Webhook para recibir mensajes desde Twilio
   */
  @Get('webhook')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verificar webhook de WhatsApp Cloud API',
    description:
      'Endpoint de verificación de Meta (hub.challenge). Se usa al guardar el webhook en el panel de Meta. ' +
      'El verify_token identifica a qué tenant pertenece la suscripción.',
  })
  @ApiQuery({ name: 'hub.mode', required: false })
  @ApiQuery({ name: 'hub.verify_token', required: false })
  @ApiQuery({ name: 'hub.challenge', required: false })
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const tenantId = token ? await this.whatsappService.resolveTenantForVerifyToken(token) : null;
    if (mode === 'subscribe' && token && tenantId) {
      return challenge;
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Recibir mensajes de WhatsApp',
    description:
      'Endpoint webhook para Twilio y WhatsApp Cloud API. ' +
      'Twilio envía datos en formato form-encoded, Cloud API envía JSON. El tenant se resuelve ' +
      'automáticamente por el AccountSid (Twilio) o phone_number_id (Cloud API).',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        MessageSid: { type: 'string', example: 'SM1234567890abcdef' },
        AccountSid: { type: 'string', example: 'ACxxxxxxxxxxxxxxxxxx' },
        From: { type: 'string', example: '+34612345678' },
        To: { type: 'string', example: '+14155238886' },
        Body: { type: 'string', example: 'Hola, ¿cómo estás?' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Mensaje recibido y procesado correctamente' })
  async handleWebhook(@Body() body: any, @Res() res: Response): Promise<void> {
    const tenantId = await this.whatsappService.resolveTenantForWebhook(body);
    if (tenantId) {
      await TenantContext.run({ tenantId }, async () => {
        await this.whatsappService.handleWebhook(body);
      });
    }
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({ success: true }));
  }

  @Get('health')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Verificar estado de conexión',
    description: 'Comprueba si el tenant autenticado tiene WhatsApp configurado y funcional.',
  })
  async healthCheck() {
    return this.whatsappService.healthCheck();
  }

  @Post('send')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({
    summary: 'Enviar mensaje de texto',
    description: 'Envía un mensaje de texto a un número de WhatsApp usando la configuración del tenant autenticado.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone_number: { type: 'string', example: '+34612345678' },
        message: { type: 'string', example: 'Hola, este es un mensaje de prueba' },
      },
      required: ['phone_number', 'message'],
    },
  })
  async sendMessage(@Body() body: { phone_number: string; message: string }) {
    return this.whatsappService.sendMessage(body.phone_number, body.message);
  }

  @Post('send-template')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Enviar mensaje con plantilla' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone_number: { type: 'string', example: '+34612345678' },
        template_name: { type: 'string', example: 'order_confirmation' },
        parameters: { type: 'array', items: { type: 'string' }, example: ['#12345', 'Juan Pérez'] },
      },
      required: ['phone_number', 'template_name'],
    },
  })
  async sendTemplate(
    @Body() body: { phone_number: string; template_name: string; parameters?: string[] },
  ) {
    return this.whatsappService.sendTemplateMessage(body.phone_number, body.template_name, body.parameters);
  }

  @Post('send-media')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @HttpCode(200)
  @ApiOperation({ summary: 'Enviar media (imagen/documento/audio/video/sticker)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        phone_number: { type: 'string', example: '+5215548780484' },
        type: { type: 'string', enum: ['image', 'document', 'audio', 'video', 'sticker'], example: 'image' },
        caption: { type: 'string', example: 'Mira esto' },
        filename: { type: 'string', example: 'archivo.pdf' },
        file: { type: 'string', format: 'binary' },
      },
      required: ['phone_number', 'type', 'file'],
    },
  })
  async sendMedia(
    @UploadedFile() file: any,
    @Body()
    body: { phone_number: string; type: 'image' | 'document' | 'audio' | 'video' | 'sticker'; caption?: string; filename?: string },
  ) {
    if (!file?.buffer?.length) {
      throw new HttpException('file is required', HttpStatus.BAD_REQUEST);
    }

    return this.whatsappService.sendMediaMessage(body.phone_number, {
      type: body.type,
      fileBuffer: file.buffer,
      mimeType: file.mimetype,
      filename: body.filename || file.originalname,
      caption: body.caption,
    });
  }

  @Get('media/:mediaId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Descargar/visualizar media (proxy Cloud API)' })
  @ApiQuery({ name: 'filename', required: false })
  async downloadMedia(
    @Param('mediaId') mediaId: string,
    @Query('filename') filename: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.whatsappService.downloadCloudMedia(mediaId, { filename });

    if (result.contentType) {
      res.setHeader('Content-Type', result.contentType);
    }
    if (result.contentDisposition) {
      res.setHeader('Content-Disposition', result.contentDisposition);
    }

    return new StreamableFile(result.stream);
  }

  @Get('message-status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Obtener estado de mensaje' })
  @ApiQuery({ name: 'message_id', type: 'string' })
  async getMessageStatus(@Query('message_id') messageId: string) {
    return this.whatsappService.getMessageStatus(messageId);
  }

  @Get('phone-numbers')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Listar números de WhatsApp (Twilio)' })
  async getPhoneNumbers() {
    return this.whatsappService.getPhoneNumbers();
  }

  // --- Configuración de la integración por tenant ---

  @Get('integration')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener la configuración de WhatsApp del tenant (sin secretos)' })
  async getIntegration(@Request() req) {
    const integration = await this.integrationsService.getForCurrentTenant();
    if (!integration) return null;
    return {
      provider: integration.provider,
      twilio_account_sid: integration.twilio_account_sid,
      twilio_whatsapp_number: integration.twilio_whatsapp_number,
      cloud_phone_number_id: integration.cloud_phone_number_id,
      cloud_waba_id: integration.cloud_waba_id,
      cloud_template_language: integration.cloud_template_language,
      verify_token: integration.verify_token,
      is_active: integration.is_active,
      has_twilio_auth_token: Boolean(integration.twilio_auth_token_encrypted),
      has_cloud_access_token: Boolean(integration.cloud_access_token_encrypted),
    };
  }

  @Patch('integration')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Guardar la configuración de WhatsApp del tenant' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        provider: { type: 'string', enum: ['twilio', 'cloud_api'] },
        twilio_account_sid: { type: 'string' },
        twilio_auth_token: { type: 'string' },
        twilio_whatsapp_number: { type: 'string' },
        cloud_access_token: { type: 'string' },
        cloud_phone_number_id: { type: 'string' },
        cloud_waba_id: { type: 'string' },
        cloud_template_language: { type: 'string' },
      },
    },
  })
  async saveIntegration(@Request() req, @Body() body: any) {
    const integration = await this.integrationsService.upsertForCurrentTenant(req.user.tenantId, body);
    return {
      provider: integration.provider,
      verify_token: integration.verify_token,
      is_active: integration.is_active,
    };
  }
}
