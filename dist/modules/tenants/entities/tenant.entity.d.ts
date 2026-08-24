import { User } from '../../users/entities/user.entity';
export declare class Tenant {
    id: string;
    name: string;
    slug: string;
    contact_email: string;
    legal_type: 'fisica' | 'moral';
    tax_id: string;
    legal_name: string;
    status: 'trial' | 'active' | 'suspended' | 'cancelled';
    plan: string;
    bulk_messaging_enabled: boolean;
    wa_templates_enabled: boolean;
    created_at: Date;
    updated_at: Date;
    users: User[];
}
//# sourceMappingURL=tenant.entity.d.ts.map