import { Conversation } from '../../conversations/entities/conversation.entity';
import { User } from '../../users/entities/user.entity';
export declare class Message {
    id: string;
    conversation_id: string;
    sender_type: 'user' | 'contact' | 'agent';
    sender_id: string;
    content: string;
    message_type: 'text' | 'image' | 'document' | 'audio' | 'video' | 'sticker';
    media_id: string;
    media_mime_type: string;
    media_sha256: string;
    media_filename: string;
    media_caption: string;
    media_url: string;
    metadata: Record<string, any>;
    is_from_whatsapp: boolean;
    whatsapp_message_id: string;
    is_read: boolean;
    read_at: Date;
    created_at: Date;
    updated_at: Date;
    conversation: Conversation;
    sender: User;
}
//# sourceMappingURL=message.entity.d.ts.map