import { Conversation } from '../../conversations/entities/conversation.entity';
import { Order } from '../../orders/entities/order.entity';
export declare class Contact {
    id: string;
    phone_number: string;
    name: string;
    avatar_url: string;
    last_seen: Date;
    created_at: Date;
    updated_at: Date;
    conversations: Conversation[];
    orders: Order[];
}
//# sourceMappingURL=contact.entity.d.ts.map