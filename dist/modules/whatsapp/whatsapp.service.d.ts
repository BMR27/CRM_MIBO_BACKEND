import { ContactsService } from '../contacts/contacts.service';
import { ConversationsService } from '../conversations/conversations.service';
import { MessagesService } from '../messages/messages.service';
import { Readable } from 'stream';
import { WhatsappIntegrationsService } from './whatsapp-integrations.service';
export declare class WhatsappService {
    private integrationsService;
    private contactsService;
    private conversationsService;
    private messagesService;
    private readonly logger;
    constructor(integrationsService: WhatsappIntegrationsService, contactsService: ContactsService, conversationsService: ConversationsService, messagesService: MessagesService);
    /** Config del tenant actual (resuelto vía TenantContext). Lanza si no está configurado. */
    private getConfig;
    private buildTwilioClient;
    /**
     * Resuelve a qué tenant pertenece un webhook entrante, SIN tener todavía un TenantContext
     * activo (lo llama el controller antes de envolver el procesamiento en TenantContext.run()).
     */
    resolveTenantForWebhook(body: any): Promise<string | null>;
    resolveTenantForVerifyToken(token: string): Promise<string | null>;
    handleWebhook(body: any): Promise<void>;
    handleCloudWebhook(body: any): Promise<void>;
    private processIncomingMessage;
    sendMessage(phoneNumber: string, message: string): Promise<{
        success: boolean;
        whatsapp_message_id?: string;
        error?: string;
        error_code?: number;
        hint?: string;
    }>;
    sendMediaMessage(phoneNumber: string, input: {
        type: 'image' | 'document' | 'audio' | 'video' | 'sticker';
        fileBuffer: Buffer;
        mimeType?: string;
        filename?: string;
        caption?: string;
    }): Promise<{
        success: boolean;
        whatsapp_message_id?: string;
        media_id?: string;
        error?: string;
        error_code?: number;
        hint?: string;
    }>;
    downloadCloudMedia(mediaId: string, options?: {
        filename?: string;
    }): Promise<{
        stream: Readable;
        contentType?: string;
        contentDisposition?: string;
    }>;
    healthCheck(): Promise<{
        status: string;
    }>;
    sendTemplateMessage(phoneNumber: string, templateName: string, variables?: string[] | Record<string, string>): Promise<{
        success: boolean;
        whatsapp_message_id?: string;
        error?: string;
        error_code?: number;
        hint?: string;
    }>;
    private normalizeTemplateVariables;
    private sendCloudTemplateMessage;
    private uploadCloudMedia;
    private sendCloudMediaMessage;
    private formatCloudApiError;
    getMessageStatus(messageId: string): Promise<{
        status: string;
    }>;
    getPhoneNumbers(): Promise<any[]>;
    private getCloudMessageText;
    private parseCloudMessage;
    normalizePhoneNumber(value: string): string;
}
//# sourceMappingURL=whatsapp.service.d.ts.map