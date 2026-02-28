import { TwilioService } from './twilio.service';
import { MessagesService } from '../modules/messages/messages.service';
export declare class TwilioController {
    private readonly twilioService;
    private readonly messagesService;
    constructor(twilioService: TwilioService, messagesService: MessagesService);
    /**
     * Endpoint para obtener plantillas aprobadas de WhatsApp en Twilio
     * POST /api/twilio/wa-templates { serviceSid }
     */
    getApprovedWATemplates(): Promise<any>;
    sendWATemplate(body: any): Promise<{
        success: boolean;
        twilio: any;
    }>;
    optionsSendWaTemplate(): {};
}
//# sourceMappingURL=twilio.controller.d.ts.map