export declare class TwilioService {
    private client;
    constructor();
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
}
//# sourceMappingURL=twilio.service.d.ts.map