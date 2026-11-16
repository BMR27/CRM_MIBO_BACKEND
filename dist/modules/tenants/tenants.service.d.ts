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
    /**
     * Branding por tenant: cada campo es independiente y opcional. Un valor ausente en
     * el body deja el campo tal cual está; un string vacío lo limpia (vuelve a null, es
     * decir, al branding por defecto del sistema). No afecta a otros tenants.
     */
    updateBranding(id: string, input: {
        branding_logo_url?: string | null;
        branding_accent_color?: string | null;
        branding_display_name?: string | null;
    }): Promise<Tenant>;
    /**
     * Guarda el logo subido como archivo (bytes en la propia base, sin depender de un
     * filesystem persistente en el hosting) y actualiza branding_logo_url para que
     * apunte al endpoint público que lo sirve.
     */
    saveBrandingLogo(id: string, data: Buffer, mime: string): Promise<Tenant>;
    getBrandingLogo(id: string): Promise<{
        data: Buffer;
        mime: string;
    } | null>;
    /**
     * Módulos opcionales del sidebar (Citas, Agentes, Leads, Documentación API). Cada
     * tenant arranca sin ellos; solo un super-admin de plataforma puede habilitarlos.
     */
    updateModules(id: string, flags: {
        module_citas_enabled?: boolean;
        module_agentes_enabled?: boolean;
        module_leads_enabled?: boolean;
        module_docs_api_enabled?: boolean;
    }): Promise<Tenant>;
}
//# sourceMappingURL=tenants.service.d.ts.map