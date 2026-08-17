import { ApiKey } from './entities/api-key.entity';
import { TenantScopedRepository } from '../../common/tenant/tenant-scoped.repository';
export declare class ApiKeysService {
    private apiKeyRepository;
    constructor(apiKeyRepository: TenantScopedRepository<ApiKey>);
    create(name: string): Promise<{
        apiKey: ApiKey;
        rawKey: string;
    }>;
    findAllForTenant(): Promise<ApiKey[]>;
    revoke(id: string): Promise<void>;
    /**
     * Búsqueda "abierta" (sin tenant conocido todavía): el ApiKeyGuard usa este método para
     * resolver a qué tenant pertenece una API key entrante, así que no puede pasar por el
     * TenantScopedRepository (que exige tenant ya resuelto). Es la única consulta de este
     * módulo que toca el repositorio crudo.
     */
    findActiveByRawKey(rawKey: string): Promise<ApiKey | null>;
    touchLastUsed(id: string): Promise<void>;
}
//# sourceMappingURL=api-keys.service.d.ts.map