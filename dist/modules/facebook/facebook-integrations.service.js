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
exports.FacebookIntegrationsService = void 0;
const common_1 = require("@nestjs/common");
const tenant_scoped_repository_1 = require("../../common/tenant/tenant-scoped.repository");
const facebook_tokens_1 = require("./facebook.tokens");
const secret_crypto_1 = require("../../common/crypto/secret-crypto");
let FacebookIntegrationsService = class FacebookIntegrationsService {
    constructor(repo) {
        this.repo = repo;
    }
    async getForCurrentTenant() {
        return this.repo.findOne({ where: {} });
    }
    async upsertForCurrentTenant(tenantId, data) {
        const existing = await this.repo.findOne({ where: {} });
        const patch = {
            page_id: data.page_id,
        };
        if (data.page_access_token) {
            patch.page_access_token_encrypted = (0, secret_crypto_1.encryptSecret)(data.page_access_token);
        }
        if (existing) {
            await this.repo.update(existing.id, patch);
            return this.repo.findOne({ where: { id: existing.id } });
        }
        if (!data.page_access_token) {
            throw new Error('page_access_token es requerido al crear la integración');
        }
        const entity = this.repo.create({
            ...patch,
            tenant_id: tenantId,
            verify_token: (0, secret_crypto_1.generateVerifyToken)(),
            is_active: true,
        });
        return this.repo.save(entity);
    }
    async getConfigForTenant(tenantId) {
        const integration = await this.repo.raw.findOne({ where: { tenant_id: tenantId, is_active: true } });
        if (!integration)
            return null;
        return {
            pageId: integration.page_id,
            pageAccessToken: (0, secret_crypto_1.decryptSecret)(integration.page_access_token_encrypted),
        };
    }
    async findTenantIdByPageId(pageId) {
        const integration = await this.repo.raw.findOne({ where: { page_id: pageId, is_active: true } });
        return integration?.tenant_id || null;
    }
    async findTenantIdByVerifyToken(token) {
        const integration = await this.repo.raw.findOne({ where: { verify_token: token, is_active: true } });
        return integration?.tenant_id || null;
    }
};
exports.FacebookIntegrationsService = FacebookIntegrationsService;
exports.FacebookIntegrationsService = FacebookIntegrationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(facebook_tokens_1.FACEBOOK_INTEGRATION_REPO)),
    __metadata("design:paramtypes", [tenant_scoped_repository_1.TenantScopedRepository])
], FacebookIntegrationsService);
//# sourceMappingURL=facebook-integrations.service.js.map