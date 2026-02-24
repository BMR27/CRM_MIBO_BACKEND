import { ConfigService } from '@nestjs/config';
import { ContactsService } from '../contacts/contacts.service';
import { ConversationsService } from '../conversations/conversations.service';
import { MessagesService } from '../messages/messages.service';
import { Readable } from 'stream';
export declare class WhatsappService {
    private configService;
    private contactsService;
    private conversationsService;
    private messagesService;
    private readonly logger;
    private readonly twilioClient;
    private readonly twilioPhoneNumber;
    private readonly webhookToken;
    private readonly cloudAccessToken;
    private readonly cloudPhoneNumberId;
    private readonly cloudWabaId;
    private readonly cloudTemplateLanguage;
    constructor(configService: ConfigService, contactsService: ContactsService, conversationsService: ConversationsService, messagesService: MessagesService);
    validateWebhookToken(token: string): boolean;
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
    private sendCloudTextMessage;
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
    private normalizePhoneNumber;
}
//# sourceMappingURL=whatsapp.service.d.ts.map