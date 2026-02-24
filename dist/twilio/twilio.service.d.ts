export declare class TwilioService {
    private client;
    constructor();
    sendWhatsAppTemplate({ to, from, templateSid, variables, }: {
        to: string;
        from: string;
        templateSid: string;
        variables?: string[];
    }): Promise<import("twilio/lib/rest/api/v2010/account/message").MessageInstance>;
}
//# sourceMappingURL=twilio.service.d.ts.map