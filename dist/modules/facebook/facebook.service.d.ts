import { ContactsService } from '../contacts/contacts.service';
import { ConversationsService } from '../conversations/conversations.service';
import { MessagesService } from '../messages/messages.service';
import { FacebookIntegrationsService } from './facebook-integrations.service';
export declare class FacebookService {
    private integrationsService;
    private contactsService;
    private conversationsService;
    private messagesService;
    private readonly logger;
    constructor(integrationsService: FacebookIntegrationsService, contactsService: ContactsService, conversationsService: ConversationsService, messagesService: MessagesService);
    resolveTenantForWebhook(body: any): Promise<string | null>;
    resolveTenantForVerifyToken(token: string): Promise<string | null>;
    handleWebhook(body: any): Promise<void>;
    private processIncomingMessage;
    sendMessage(psid: string, text: string): Promise<{
        success: boolean;
        error?: string;
    }>;
}
//# sourceMappingURL=facebook.service.d.ts.map