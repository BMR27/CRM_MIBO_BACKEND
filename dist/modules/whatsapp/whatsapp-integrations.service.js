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
exports.WhatsappIntegrationsService = void 0;
const common_1 = require("@nestjs/common");
const tenant_scoped_repository_1 = require("../../common/tenant/tenant-scoped.repository");
const whatsapp_tokens_1 = require("./whatsapp.tokens");
const secret_crypto_1 = require("../../common/crypto/secret-crypto");
let WhatsappIntegrationsService = class WhatsappIntegrationsService {
    constructor(repo) {
        this.repo = repo;
    }
    async getForCurrentTenant() {
        return this.repo.findOne({ where: {} });
    }
    async upsertForCurrentTenant(tenantId, data) {
        const existing = await this.repo.findOne({ where: {} });
        const patch = {
            provider: data.provider,
            twilio_account_sid: data.twilio_account_sid || null,
            twilio_whatsapp_number: data.twilio_whatsapp_number || null,
            cloud_phone_number_id: data.cloud_phone_number_id || null,
            cloud_waba_id: data.cloud_waba_id || null,
            cloud_template_language: data.cloud_template_language || 'es_MX',
        };
        if (data.twilio_auth_token) {
            patch.twilio_auth_token_encrypted = (0, secret_crypto_1.encryptSecret)(data.twilio_auth_token);
        }
        if (data.cloud_access_token) {
            patch.cloud_access_token_encrypted = (0, secret_crypto_1.encryptSecret)(data.cloud_access_token);
        }
        if (existing) {
            await this.repo.update(existing.id, patch);
            return this.repo.findOne({ where: { id: existing.id } });
        }
        const entity = this.repo.create({
            ...patch,
            tenant_id: tenantId,
            verify_token: (0, secret_crypto_1.generateVerifyToken)(),
            is_active: true,
        });
        return this.repo.save(entity);
    }
    async resolveConfig(integration) {
        return {
            provider: integration.provider,
            twilioAccountSid: integration.twilio_account_sid || undefined,
            twilioAuthToken: integration.twilio_auth_token_encrypted
                ? (0, secret_crypto_1.decryptSecret)(integration.twilio_auth_token_encrypted)
                : undefined,
            twilioWhatsappNumber: integration.twilio_whatsapp_number || undefined,
            cloudAccessToken: integration.cloud_access_token_encrypted
                ? (0, secret_crypto_1.decryptSecret)(integration.cloud_access_token_encrypted)
                : undefined,
            cloudPhoneNumberId: integration.cloud_phone_number_id || undefined,
            cloudWabaId: integration.cloud_waba_id || undefined,
            cloudTemplateLanguage: integration.cloud_template_language || 'es_MX',
        };
    }
    async getConfigForTenant(tenantId) {
        const integration = await this.repo.raw.findOne({ where: { tenant_id: tenantId, is_active: true } });
        if (!integration)
            return null;
        return this.resolveConfig(integration);
    }
    // --- Lookups "abiertos" (sin tenant conocido) para resolver el tenant de un webhook entrante ---
    async findTenantIdByVerifyToken(token) {
        const integration = await this.repo.raw.findOne({ where: { verify_token: token, is_active: true } });
        return integration?.tenant_id || null;
    }
    async findTenantIdByTwilioAccountSid(accountSid) {
        const integration = await this.repo.raw.findOne({
            where: { twilio_account_sid: accountSid, is_active: true },
        });
        return integration?.tenant_id || null;
    }
    async findTenantIdByCloudPhoneNumberId(phoneNumberId) {
        const integration = await this.repo.raw.findOne({
            where: { cloud_phone_number_id: phoneNumberId, is_active: true },
        });
        return integration?.tenant_id || null;
    }
};
exports.WhatsappIntegrationsService = WhatsappIntegrationsService;
exports.WhatsappIntegrationsService = WhatsappIntegrationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(whatsapp_tokens_1.WHATSAPP_INTEGRATION_REPO)),
    __metadata("design:paramtypes", [tenant_scoped_repository_1.TenantScopedRepository])
], WhatsappIntegrationsService);
//# sourceMappingURL=whatsapp-integrations.service.js.map