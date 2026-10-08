import { BadRequestException, Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { InternalSecretGuard } from '../../common/auth/internal-secret.guard';
import { WebhookDispatchService } from './webhook-dispatch.service';

/**
 * Endpoints internos (servicio-a-servicio) protegidos por InternalSecretGuard, no por JWT.
 * El frontend (que procesa los mensajes entrantes de WhatsApp vía Twilio) llama aquí para
 * reenviar eventos al webhook saliente del tenant, reusando la lógica de firma/reintento
 * de WebhookDispatchService en vez de duplicarla.
 */
@ApiExcludeController()
@Controller('internal/webhooks')
@UseGuards(InternalSecretGuard)
export class InternalWebhooksController {
  constructor(private readonly webhookDispatchService: WebhookDispatchService) {}

  @Post('dispatch')
  async dispatch(@Body() body: { tenantId?: string; event?: string; data?: Record<string, any> }) {
    const tenantId = String(body?.tenantId || '').trim();
    const event = String(body?.event || '').trim();
    if (!tenantId || !event) {
      throw new BadRequestException('tenantId y event son requeridos');
    }
    return this.webhookDispatchService.dispatch(tenantId, event, body?.data || {});
  }
}
