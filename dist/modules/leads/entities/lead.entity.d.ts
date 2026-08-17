export declare class Lead {
    id: string;
    tenant_id: string;
    name: string;
    email: string;
    phone_number: string;
    company: string;
    custom_fields: Record<string, any>;
    source: 'web' | 'api';
    source_detail: string;
    status: 'new' | 'contacted' | 'converted' | 'discarded';
    contact_id: string;
    created_at: Date;
    updated_at: Date;
}
//# sourceMappingURL=lead.entity.d.ts.map