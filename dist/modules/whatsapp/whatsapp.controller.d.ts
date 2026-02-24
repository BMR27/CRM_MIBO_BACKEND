import { StreamableFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WhatsappService } from './whatsapp.service';
import type { Response } from 'express';
export declare class WhatsappController {
    private whatsappService;
    private configService;
    constructor(whatsappService: WhatsappService, configService: ConfigService);
    /**
     * Webhook para recibir mensajes desde Twilio
     */
    verifyWebhook(mode: string, token: string, challenge: string): Promise<string>;
    handleWebhook(body: any): Promise<{
        success: boolean;
    }>;
    /**
     * Health check - Verificar conexión con Twilio
     */
    healthCheck(): Promise<{
        status: string;
    }>;
    /**
     * Enviar mensaje de texto por WhatsApp
     */
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
    /**
     * Enviar mensaje con plantilla
     */
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
    /**
     * Enviar mensaje con media (Cloud API)
     */
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
    /**
     * Descargar/visualizar media desde WhatsApp Cloud API (proxy)
     */
    downloadMedia(mediaId: string, filename: string | undefined, res: Response): Promise<StreamableFile>;
    /**
     * Obtener estado de un mensaje
     */
    getMessageStatus(messageId: string): Promise<{
        status: string;
    }>;
    /**
     * Obtener números de teléfono disponibles
     */
    getPhoneNumbers(): Promise<any[]>;
}
//# sourceMappingURL=whatsapp.controller.d.ts.map