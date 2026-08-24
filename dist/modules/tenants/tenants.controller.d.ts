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
}
//# sourceMappingURL=tenants.controller.d.ts.map