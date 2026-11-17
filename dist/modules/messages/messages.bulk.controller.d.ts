interface Contacto {
    nombre: string;
    telefono: string;
    [key: string]: any;
}
import { Repository } from 'typeorm';
import { CampaignRecipient } from './entities/campaign-recipient.entity';
import { TwilioService } from '../../twilio/twilio.service';
import { ContactsService } from '../contacts/contacts.service';
import { ConversationsService } from '../conversations/conversations.service';
import { MessagesService } from './messages.service';
export declare class MessagesBulkController {
    private readonly twilioService;
    private readonly contactsService;
    private readonly conversationsService;
    private readonly messagesService;
    private readonly campaignRecipientsRepository;
    constructor(twilioService: TwilioService, contactsService: ContactsService, conversationsService: ConversationsService, messagesService: MessagesService, campaignRecipientsRepository: Repository<CampaignRecipient>);
    /**
     * Deja constancia de un destinatario en la bitácora de la campaña. Nunca debe
     * interrumpir el envío: si la bitácora falla, se registra en consola y se sigue.
     */
    private logRecipient;
    uploadBulk(file: Express.Multer.File, body?: any, req?: any): Promise<{
        error: string;
        success?: undefined;
        rows?: undefined;
        results?: undefined;
        preview?: undefined;
    } | {
        success: boolean;
        rows: number;
        results: any[];
        preview: Contacto[];
        error?: undefined;
    }>;
}
export {};
//# sourceMappingURL=messages.bulk.controller.d.ts.map