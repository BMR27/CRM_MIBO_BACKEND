import { Injectable, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';
import axios from 'axios';
import { TenantsService } from './tenants.service';

export interface WebhookDispatchResult {
  skipped: boolean;
  success?: boolean;
  retried?: boolean;
  error?: string;
}

/**
 * Envía eventos salientes al webhook_url configurado por cada tenant, firmados con
 * HMAC-SHA256 usando su webhook_secret. No lanza si el envío falla (los eventos de
 * mensajería no deben tumbar el flujo que los origina); registra el error y regresa
 * el resultado para que el llamador decida si loguearlo.
 */
@Injectable()
export class WebhookDispatchService {
  private readonly logger = new Logger(WebhookDispatchService.name);

  constructor(private readonly tenantsService: TenantsService) {}

  async dispatch(
    tenantId: string,
    event: string,
    data: Record<string, any>,
  ): Promise<WebhookDispatchResult> {
    const tenant = await this.tenantsService.findById(tenantId);
    if (!tenant?.webhook_events_enabled || !tenant.webhook_url) {
      return { skipped: true };
    }

    const secret = await this.tenantsService.getWebhookSecretPlain(tenantId);
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      tenant_id: tenantId,
      data,
    };
    const body = JSON.stringify(payload);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Mibo-Event': event,
    };
    if (secret) {
      headers['X-Mibo-Signature'] = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
    }

    const attempt = () => axios.post(tenant.webhook_url as string, body, { headers, timeout: 5000 });

    try {
      await attempt();
      return { skipped: false, success: true };
    } catch (firstError: any) {
      this.logger.warn(
        `Primer intento de webhook falló (tenant ${tenantId}, evento ${event}): ${firstError?.message}`,
      );
      try {
        await attempt();
        return { skipped: false, success: true, retried: true };
      } catch (secondError: any) {
        this.logger.error(
          `Webhook saliente falló tras reintento (tenant ${tenantId}, evento ${event}, url ${tenant.webhook_url}): ${secondError?.message}`,
        );
        return { skipped: false, success: false, retried: true, error: secondError?.message };
      }
    }
  }
}
