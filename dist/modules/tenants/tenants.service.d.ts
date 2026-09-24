import { EntityManager, Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
export declare class TenantsService {
    private tenantsRepository;
    constructor(tenantsRepository: Repository<Tenant>);
    findById(id: string): Promise<Tenant | null>;
    findAll(): Promise<Tenant[]>;
    findBySlug(slug: string): Promise<Tenant | null>;
    generateUniqueSlug(name: string, manager?: EntityManager): Promise<string>;
    createTenant(data: {
        name: string;
        contact_email?: string;
        legal_type?: 'fisica' | 'moral';
        tax_id?: string;
        legal_name?: string;
    }, manager: EntityManager): Promise<Tenant>;
    renameTenant(id: string, name: string): Promise<Tenant>;
    updateFeatureFlags(id: string, flags: {
        bulk_messaging_enabled?: boolean;
        wa_templates_enabled?: boolean;
    }): Promise<Tenant>;
    /**
     * Actualiza la URL de webhook saliente y/o su estado (habilitado/deshabilitado).
     * Si se habilita y el tenant todavía no tiene un secreto de firma, genera uno nuevo
     * y lo devuelve en texto plano (solo esta vez) para que el admin lo copie.
     */
    updateWebhookConfig(id: string, input: {
        webhook_url?: string | null;
        enabled?: boolean;
    }): Promise<{
        tenant: Tenant;
        plainSecret?: string;
    }>;
    rotateWebhookSecret(id: string): Promise<string>;
    getWebhookSecretPlain(id: string): Promise<string | null>;
}
//# sourceMappingURL=tenants.service.d.ts.map