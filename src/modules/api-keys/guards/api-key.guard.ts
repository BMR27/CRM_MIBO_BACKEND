import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiKeysService } from '../api-keys.service';

/**
 * Autentica requests públicas (sin JWT) vía header `X-API-Key`. Al pasar, deja
 * `req.user = { tenantId, apiKeyId, role: 'api' }` — mismo shape que usa JwtStrategy,
 * así que TenantInterceptor y el resto del pipeline no necesitan saber cuál guard corrió.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const rawKey = req.headers['x-api-key'];

    if (!rawKey || typeof rawKey !== 'string') {
      throw new UnauthorizedException('Falta el header X-API-Key');
    }

    const apiKey = await this.apiKeysService.findActiveByRawKey(rawKey);
    if (!apiKey) {
      throw new UnauthorizedException('API key inválida o inactiva');
    }
    if (apiKey.expires_at && apiKey.expires_at.getTime() < Date.now()) {
      throw new UnauthorizedException('API key expirada');
    }

    await this.apiKeysService.touchLastUsed(apiKey.id);

    req.user = { tenantId: apiKey.tenant_id, apiKeyId: apiKey.id, role: 'api' };
    return true;
  }
}
