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
    webhook_url: string | null;
    webhook_secret_encrypted: string | null;
    webhook_events_enabled: boolean;
    branding_logo_url: string | null;
    branding_accent_color: string | null;
    branding_display_name: string | null;
    branding_logo_data: Buffer | null;
    branding_logo_mime: string | null;
    module_citas_enabled: boolean;
    module_agentes_enabled: boolean;
    module_leads_enabled: boolean;
    module_docs_api_enabled: boolean;
    created_at: Date;
    updated_at: Date;
    users: User[];
}
//# sourceMappingURL=tenant.entity.d.ts.map