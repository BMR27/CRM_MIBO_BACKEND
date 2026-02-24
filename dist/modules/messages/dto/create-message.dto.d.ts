export declare class CreateMessageDto {
    conversation_id: string;
    sender_type: string;
    sender_id?: string;
    content: string;
    message_type?: string;
    media_id?: string;
    media_mime_type?: string;
    media_sha256?: string;
    media_filename?: string;
    media_caption?: string;
    media_url?: string;
    metadata?: Record<string, any>;
    is_from_whatsapp?: boolean;
    whatsapp_message_id?: string;
}
//# sourceMappingURL=create-message.dto.d.ts.map