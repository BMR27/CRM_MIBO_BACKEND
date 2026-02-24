import { Contact } from '../../contacts/entities/contact.entity';
import { User } from '../../users/entities/user.entity';
import { Message } from '../../messages/entities/message.entity';
import { ConversationTag } from '../../conversation-tags/entities/conversation-tag.entity';
export declare class Conversation {
    id: string;
    contact_id: string;
    assigned_agent_id: string;
    status: 'active' | 'paused' | 'resolved';
    priority: 'low' | 'medium' | 'high';
    notes: string;
    last_message_at: Date;
    created_at: Date;
    updated_at: Date;
    contact: Contact;
    assigned_agent: User;
    messages: Message[];
    tags: ConversationTag[];
}
//# sourceMappingURL=conversation.entity.d.ts.map