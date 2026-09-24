import { WhatsappIntegrationsService } from '../modules/whatsapp/whatsapp-integrations.service';
import { MessagesService } from '../modules/messages/messages.service';
import { WebhookDispatchService } from '../modules/tenants/webhook-dispatch.service';
export declare class TwilioService {
    private whatsappIntegrationsService;
    private messagesService;
    private webhookDispatchService;
    private readonly allowedWATemplates;
    constructor(whatsappIntegrationsService: WhatsappIntegrationsService, messagesService: MessagesService, webhookDispatchService: WebhookDispatchService);
    /**
     * URL pública donde Twilio debe notificar cambios de estado del mensaje (enviado,
     * entregado, leído, fallido). Requiere PUBLIC_API_URL configurada (dominio público
     * del backend); si no está configurada, se omite y no llegan actualizaciones de estado.
     */
    private getStatusCallbackUrl;
    isTemplateAllowed(sid: string): boolean;
    private getCredentials;
    private getClient;
    /**
     * Lista plantillas aprobadas de WhatsApp en Twilio usando Content API vía HTTP
     */
    listApprovedWATemplates(serviceSid?: string): Promise<any>;
    sendWhatsAppTemplate({ to, from, contentSid, variables, }: {
        to: string;
        from: string;
        contentSid: string;
        variables?: string[];
    }): Promise<import("twilio/lib/rest/api/v2010/account/message").MessageInstance>;
    /**
     * Envía mensaje WhatsApp usando ContentSid y ContentVariables exactamente como el cURL
     */
    sendWhatsAppTemplateViaHttp({ to, from, contentSid, variables, }: {
        to: string;
        from: string;
        contentSid: string;
        variables?: string[];
    }): Promise<any>;
    sendWhatsAppMedia({ to, from, mediaUrl, body, }: {
        to: string;
        from: string;
        mediaUrl: string;
        body?: string;
    }): Promise<import("twilio/lib/rest/api/v2010/account/message").MessageInstance>;
    downloadFirstMediaByMessageSid(messageSid: string): Promise<{
        data: Buffer<any>;
        contentType: string;
        contentDisposition: string;
    }>;
    getDefaultWhatsappFrom(): Promise<string | undefined>;
    /**
     * Recibe el status callback que Twilio envía por cada cambio de estado del mensaje
     * (queued, sent, delivered, read, failed, undelivered), actualiza el mensaje asociado
     * y reenvía el evento al webhook_url del tenant (si lo tiene configurado y habilitado).
     *
     * Este endpoint es público (Twilio no envía JWT), así que el tenantId viene en la URL
     * (definida por nosotros mismos como statusCallback al enviar el mensaje) en vez de
     * resolverse por el usuario autenticado.
     */
    handleStatusCallback(tenantId: string, body: Record<string, any>): Promise<{
        received: boolean;
        ignored: boolean;
        message_found?: undefined;
        webhook?: undefined;
    } | {
        received: boolean;
        message_found: boolean;
        webhook: import("../modules/tenants/webhook-dispatch.service").WebhookDispatchResult;
        ignored?: undefined;
    }>;
}
//# sourceMappingURL=twilio.service.d.ts.map