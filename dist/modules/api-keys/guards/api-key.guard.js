"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyGuard = void 0;
const common_1 = require("@nestjs/common");
const api_keys_service_1 = require("../api-keys.service");
/**
 * Autentica requests públicas (sin JWT) vía header `X-API-Key`. Al pasar, deja
 * `req.user = { tenantId, apiKeyId, role: 'api' }` — mismo shape que usa JwtStrategy,
 * así que TenantInterceptor y el resto del pipeline no necesitan saber cuál guard corrió.
 */
let ApiKeyGuard = class ApiKeyGuard {
    constructor(apiKeysService) {
        this.apiKeysService = apiKeysService;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const rawKey = req.headers['x-api-key'];
        if (!rawKey || typeof rawKey !== 'string') {
            throw new common_1.UnauthorizedException('Falta el header X-API-Key');
        }
        const apiKey = await this.apiKeysService.findActiveByRawKey(rawKey);
        if (!apiKey) {
            throw new common_1.UnauthorizedException('API key inválida o inactiva');
        }
        if (apiKey.expires_at && apiKey.expires_at.getTime() < Date.now()) {
            throw new common_1.UnauthorizedException('API key expirada');
        }
        await this.apiKeysService.touchLastUsed(apiKey.id);
        req.user = { tenantId: apiKey.tenant_id, apiKeyId: apiKey.id, role: 'api' };
        return true;
    }
};
exports.ApiKeyGuard = ApiKeyGuard;
exports.ApiKeyGuard = ApiKeyGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_keys_service_1.ApiKeysService])
], ApiKeyGuard);
//# sourceMappingURL=api-key.guard.js.map