import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ApiKeysService } from '../api-keys.service';
/**
 * Autentica requests públicas (sin JWT) vía header `X-API-Key`. Al pasar, deja
 * `req.user = { tenantId, apiKeyId, role: 'api' }` — mismo shape que usa JwtStrategy,
 * así que TenantInterceptor y el resto del pipeline no necesitan saber cuál guard corrió.
 */
export declare class ApiKeyGuard implements CanActivate {
    private apiKeysService;
    constructor(apiKeysService: ApiKeysService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
//# sourceMappingURL=api-key.guard.d.ts.map