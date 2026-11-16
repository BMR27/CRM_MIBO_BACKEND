import { TenantsService } from './tenants.service';
export declare class TenantsController {
    private tenantsService;
    constructor(tenantsService: TenantsService);
    getAll(): Promise<import("./entities/tenant.entity").Tenant[]>;
    getMe(req: any): Promise<import("./entities/tenant.entity").Tenant>;
    updateMe(req: any, body: {
        name: string;
    }): Promise<import("./entities/tenant.entity").Tenant>;
    updateFeatures(req: any, body: {
        bulk_messaging_enabled?: boolean;
        wa_templates_enabled?: boolean;
    }): Promise<import("./entities/tenant.entity").Tenant>;
    updateBranding(req: any, body: {
        branding_logo_url?: string | null;
        branding_accent_color?: string | null;
        branding_display_name?: string | null;
    }): Promise<import("./entities/tenant.entity").Tenant>;
    uploadBrandingLogo(req: any, file: Express.Multer.File): Promise<import("./entities/tenant.entity").Tenant>;
    updateModules(id: string, body: {
        module_citas_enabled?: boolean;
        module_agentes_enabled?: boolean;
        module_leads_enabled?: boolean;
        module_docs_api_enabled?: boolean;
    }): Promise<import("./entities/tenant.entity").Tenant>;
    getWebhook(req: any): Promise<{
        webhook_url: string;
        webhook_events_enabled: boolean;
        has_secret: boolean;
    }>;
    updateWebhook(req: any, body: {
        webhook_url?: string | null;
        enabled?: boolean;
    }): Promise<{
        webhook_secret?: string;
        warning?: string;
        webhook_url: string;
        webhook_events_enabled: boolean;
        has_secret: boolean;
    }>;
    rotateWebhookSecret(req: any): Promise<{
        webhook_secret: string;
        warning: string;
    }>;
}
//# sourceMappingURL=tenants.controller.d.ts.map