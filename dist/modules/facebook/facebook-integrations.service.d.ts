import { FacebookIntegration } from './entities/facebook-integration.entity';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
export interface FacebookResolvedConfig {
    pageId: string;
    pageAccessToken: string;
}
export declare class FacebookIntegrationsService {
    private repo;
    constructor(repo: TenantScopedRepository<FacebookIntegration>);
    getForCurrentTenant(): Promise<FacebookIntegration | null>;
    upsertForCurrentTenant(tenantId: string, data: {
        page_id: string;
        page_access_token?: string;
    }): Promise<FacebookIntegration>;
    getConfigForTenant(tenantId: string): Promise<FacebookResolvedConfig | null>;
    findTenantIdByPageId(pageId: string): Promise<string | null>;
    findTenantIdByVerifyToken(token: string): Promise<string | null>;
}
//# sourceMappingURL=facebook-integrations.service.d.ts.map