import { Body, Controller, Get, HttpCode, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VoiceService } from './voice.service';
import { VoiceIntegrationsService } from './voice-integrations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantContext } from '../../common/tenant/tenant-context';

@ApiTags('Voice - Llamadas (Twilio Voice / WebRTC)')
@Controller('voice')
export class VoiceController {
  constructor(
    private voiceService: VoiceService,
    private integrationsService: VoiceIntegrationsService,
  ) {}

  @Post('token')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Obtener un Access Token de Twilio para inicializar el softphone del navegador' })
  async getToken(@Request() req) {
    return this.voiceService.generateAccessToken(req.user.id);
  }

  @Post('twiml/outgoing')
  @HttpCode(200)
  @ApiOperation({
    summary: 'TwiML para llamadas salientes (lo invoca Twilio, no se llama directo)',
    description:
      'El softphone del navegador manda `tenantId` como parámetro custom en device.connect({ params }), ' +
      'junto con el número a marcar (`To`) — así este endpoint, compartido por todos los tenants, sabe ' +
      'con qué credenciales/callerId responder.',
  })
  async twimlOutgoing(@Body() body: { To?: string; tenantId?: string }) {
    const tenantId = body.tenantId;
    const to = body.To;
    if (!tenantId || !to) {
      return '<Response><Say>Llamada inválida</Say></Response>';
    }
    return TenantContext.run({ tenantId }, async () => {
      return this.voiceService.buildOutgoingTwiml(to);
    });
  }

  @Post('twiml/incoming')
  @HttpCode(200)
  @ApiOperation({ summary: 'TwiML para llamadas entrantes al número de voz del tenant (lo invoca Twilio)' })
  async twimlIncoming(@Body() body: { From?: string; To?: string; CallSid?: string }) {
    const to = String(body?.To || '').trim();
    const tenantId = to ? await this.voiceService.resolveTenantForIncoming(to) : null;
    if (!tenantId) {
      return '<Response><Say>Número no configurado</Say></Response>';
    }
    await TenantContext.run({ tenantId }, async () => {
      await this.voiceService.logIncomingCall({
        tenantId,
        from: String(body?.From || ''),
        to,
        callSid: String(body?.CallSid || ''),
      });
    });
    return this.voiceService.buildIncomingTwiml(tenantId);
  }

  @Post('webhook/status')
  @HttpCode(200)
  @ApiOperation({ summary: 'Callback de estado de llamada (lo invoca Twilio)' })
  async statusWebhook(@Body() body: { CallSid?: string; CallStatus?: string; CallDuration?: string }) {
    if (body?.CallSid && body?.CallStatus) {
      await this.voiceService.updateStatusByCallSid(
        body.CallSid,
        body.CallStatus,
        body.CallDuration ? Number(body.CallDuration) : undefined,
      );
    }
    return { success: true };
  }

  @Get('integration')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener la configuración de Voice del tenant (sin secretos)' })
  async getIntegration() {
    const integration = await this.integrationsService.getForCurrentTenant();
    if (!integration) return null;
    return {
      twilio_account_sid: integration.twilio_account_sid,
      twilio_api_key_sid: integration.twilio_api_key_sid,
      twiml_app_sid: integration.twiml_app_sid,
      voice_number: integration.voice_number,
      is_active: integration.is_active,
    };
  }

  @Patch('integration')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Guardar la configuración de Voice del tenant' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        twilio_account_sid: { type: 'string' },
        twilio_auth_token: { type: 'string' },
        twilio_api_key_sid: { type: 'string' },
        twilio_api_key_secret: { type: 'string' },
        twiml_app_sid: { type: 'string' },
        voice_number: { type: 'string' },
      },
      required: ['twilio_account_sid', 'twilio_api_key_sid', 'twiml_app_sid', 'voice_number'],
    },
  })
  async saveIntegration(@Request() req, @Body() body: any) {
    const integration = await this.integrationsService.upsertForCurrentTenant(req.user.tenantId, body);
    return {
      twilio_account_sid: integration.twilio_account_sid,
      voice_number: integration.voice_number,
      is_active: integration.is_active,
    };
  }
}
