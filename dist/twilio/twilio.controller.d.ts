import { TwilioService } from './twilio.service';
export declare class TwilioController {
    private readonly twilioService;
    constructor(twilioService: TwilioService);
    sendWATemplate(body: any): Promise<import("twilio/lib/rest/api/v2010/account/message").MessageInstance>;
}
//# sourceMappingURL=twilio.controller.d.ts.map