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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeysService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const tenant_scoped_repository_1 = require("../../common/tenant/tenant-scoped.repository");
const api_keys_tokens_1 = require("./api-keys.tokens");
const KEY_PREFIX = 'mibo_lv_';
function hashKey(rawKey) {
    return (0, crypto_1.createHash)('sha256').update(rawKey).digest('hex');
}
let ApiKeysService = class ApiKeysService {
    constructor(apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }
    async create(name) {
        const secret = (0, crypto_1.randomBytes)(24).toString('base64url');
        const rawKey = `${KEY_PREFIX}${secret}`;
        const keyPrefix = rawKey.slice(0, 12);
        const entity = this.apiKeyRepository.create({
            name,
            key_prefix: keyPrefix,
            key_hash: hashKey(rawKey),
            is_active: true,
        });
        const apiKey = await this.apiKeyRepository.save(entity);
        return { apiKey, rawKey };
    }
    async findAllForTenant() {
        return this.apiKeyRepository.find({ order: { created_at: 'DESC' } });
    }
    async revoke(id) {
        await this.apiKeyRepository.update(id, { is_active: false });
    }
    /**
     * Búsqueda "abierta" (sin tenant conocido todavía): el ApiKeyGuard usa este método para
     * resolver a qué tenant pertenece una API key entrante, así que no puede pasar por el
     * TenantScopedRepository (que exige tenant ya resuelto). Es la única consulta de este
     * módulo que toca el repositorio crudo.
     */
    async findActiveByRawKey(rawKey) {
        const hash = hashKey(rawKey);
        return this.apiKeyRepository.raw.findOne({ where: { key_hash: hash, is_active: true } });
    }
    async touchLastUsed(id) {
        await this.apiKeyRepository.raw.update(id, { last_used_at: new Date() });
    }
};
exports.ApiKeysService = ApiKeysService;
exports.ApiKeysService = ApiKeysService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(api_keys_tokens_1.API_KEY_REPO)),
    __metadata("design:paramtypes", [tenant_scoped_repository_1.TenantScopedRepository])
], ApiKeysService);
//# sourceMappingURL=api-keys.service.js.map