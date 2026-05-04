import { TwilioService } from './twilio.service';
import { MessagesService } from '../modules/messages/messages.service';
import { Response } from 'express';
export declare class TwilioController {
    private readonly twilioService;
    private readonly messagesService;
    constructor(twilioService: TwilioService, messagesService: MessagesService);
    /**
     * Endpoint para obtener plantillas aprobadas de WhatsApp en Twilio
     * POST /api/twilio/wa-templates { serviceSid }
     */
    getApprovedWATemplates(body: any): Promise<any>;
    sendWATemplate(body: any): Promise<{
        success: boolean;
        twilio: any;
    }>;
    sendWAMedia(body: any): Promise<{
        success: boolean;
        twilio: import("twilio/lib/rest/api/v2010/account/message").MessageInstance;
    }>;
    optionsSendWaTemplate(): {};
    optionsSendWaMedia(): {};
    getMediaByMessage(messageSid: string, filename: string | undefined, res: Response): Promise<void>;
}
//# sourceMappingURL=twilio.controller.d.ts.map