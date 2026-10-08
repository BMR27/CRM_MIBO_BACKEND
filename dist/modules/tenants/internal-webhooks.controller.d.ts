import { WebhookDispatchService } from './webhook-dispatch.service';
/**
 * Endpoints internos (servicio-a-servicio) protegidos por InternalSecretGuard, no por JWT.
 * El frontend (que procesa los mensajes entrantes de WhatsApp vía Twilio) llama aquí para
 * reenviar eventos al webhook saliente del tenant, reusando la lógica de firma/reintento
 * de WebhookDispatchService en vez de duplicarla.
 */
export declare class InternalWebhooksController {
    private readonly webhookDispatchService;
    constructor(webhookDispatchService: WebhookDispatchService);
    dispatch(body: {
        tenantId?: string;
        event?: string;
        data?: Record<string, any>;
    }): Promise<import("./webhook-dispatch.service").WebhookDispatchResult>;
}
//# sourceMappingURL=internal-webhooks.controller.d.ts.map