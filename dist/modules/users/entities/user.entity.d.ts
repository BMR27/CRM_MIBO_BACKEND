import { Conversation } from '../../conversations/entities/conversation.entity';
import { Message } from '../../messages/entities/message.entity';
import { Macro } from '../../macros/entities/macro.entity';
import { Role } from '../../roles/entities/role.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
export declare class User {
    id: string;
    tenant_id: string;
    tenant: Tenant;
    email: string;
    password_hash: string;
    name: string;
    role_id: string;
    role: Role;
    avatar_url: string;
    status: 'available' | 'busy' | 'offline';
    is_platform_admin: boolean;
    created_at: Date;
    updated_at: Date;
    assigned_conversations: Conversation[];
    sent_messages: Message[];
    created_macros: Macro[];
}
//# sourceMappingURL=user.entity.d.ts.map