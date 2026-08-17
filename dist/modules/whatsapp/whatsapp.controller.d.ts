import { StreamableFile } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappIntegrationsService } from './whatsapp-integrations.service';
import type { Response } from 'express';
export declare class WhatsappController {
    private whatsappService;
    private integrationsService;
    constructor(whatsappService: WhatsappService, integrationsService: WhatsappIntegrationsService);
    /**
     * Webhook para recibir mensajes desde Twilio
     */
    verifyWebhook(mode: string, token: string, challenge: string): Promise<string>;
    handleWebhook(body: any, res: Response): Promise<void>;
    healthCheck(): Promise<{
        status: string;
    }>;
    sendMessage(body: {
        phone_number: string;
        message: string;
    }): Promise<{
        success: boolean;
        whatsapp_message_id?: string;
        error?: string;
        error_code?: number;
        hint?: string;
    }>;
    sendTemplate(body: {
        phone_number: string;
        template_name: string;
        parameters?: string[];
    }): Promise<{
        success: boolean;
        whatsapp_message_id?: string;
        error?: string;
        error_code?: number;
        hint?: string;
    }>;
    sendMedia(file: any, body: {
        phone_number: string;
        type: 'image' | 'document' | 'audio' | 'video' | 'sticker';
        caption?: string;
        filename?: string;
    }): Promise<{
        success: boolean;
        whatsapp_message_id?: string;
        media_id?: string;
        error?: string;
        error_code?: number;
        hint?: string;
    }>;
    downloadMedia(mediaId: string, filename: string | undefined, res: Response): Promise<StreamableFile>;
    getMessageStatus(messageId: string): Promise<{
        status: string;
    }>;
    getPhoneNumbers(): Promise<any[]>;
    getIntegration(req: any): Promise<{
        provider: "twilio" | "cloud_api";
        twilio_account_sid: string;
        twilio_whatsapp_number: string;
        cloud_phone_number_id: string;
        cloud_waba_id: string;
        cloud_template_language: string;
        verify_token: string;
        is_active: boolean;
        has_twilio_auth_token: boolean;
        has_cloud_access_token: boolean;
    }>;
    saveIntegration(req: any, body: any): Promise<{
        provider: "twilio" | "cloud_api";
        verify_token: string;
        is_active: boolean;
    }>;
}
//# sourceMappingURL=whatsapp.controller.d.ts.map