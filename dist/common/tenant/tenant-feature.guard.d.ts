import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TenantsService } from '../../modules/tenants/tenants.service';
export type TenantFeatureFlag = 'bulk_messaging_enabled' | 'wa_templates_enabled';
export declare const TENANT_FEATURE_KEY = "tenantFeature";
export declare const RequireTenantFeature: (flag: TenantFeatureFlag) => import("@nestjs/common").CustomDecorator<string>;
export declare class TenantFeatureGuard implements CanActivate {
    private reflector;
    private tenantsService;
    constructor(reflector: Reflector, tenantsService: TenantsService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
//# sourceMappingURL=tenant-feature.guard.d.ts.map