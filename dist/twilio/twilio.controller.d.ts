import { TwilioService } from './twilio.service';
import { MessagesService } from '../modules/messages/messages.service';
import { ContactsService } from '../modules/contacts/contacts.service';
import { ConversationsService } from '../modules/conversations/conversations.service';
import { Response } from 'express';
export declare class TwilioController {
    private readonly twilioService;
    private readonly messagesService;
    private readonly contactsService;
    private readonly conversationsService;
    constructor(twilioService: TwilioService, messagesService: MessagesService, contactsService: ContactsService, conversationsService: ConversationsService);
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
    /**
     * Twilio llama a esta URL (sin autenticación JWT: la usa su infraestructura, no un
     * cliente de nuestra API) cada vez que cambia el estado de un mensaje enviado con
     * statusCallback/StatusCallback configurado. El tenantId va en el path porque lo
     * definimos nosotros mismos al armar esa URL en TwilioService.getStatusCallbackUrl().
     */
    statusCallback(tenantId: string, body: any): Promise<{
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
    optionsSendWaTemplate(): {};
    optionsSendWaMedia(): {};
    getMediaByMessage(messageSid: string, filename: string | undefined, res: Response): Promise<void>;
}
//# sourceMappingURL=twilio.controller.d.ts.map