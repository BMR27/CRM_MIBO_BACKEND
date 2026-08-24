import { WhatsappIntegrationsService } from '../modules/whatsapp/whatsapp-integrations.service';
export declare class TwilioService {
    private whatsappIntegrationsService;
    private readonly allowedWATemplates;
    constructor(whatsappIntegrationsService: WhatsappIntegrationsService);
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
}
//# sourceMappingURL=twilio.service.d.ts.map