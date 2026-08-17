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
exports.VoiceIntegrationsService = void 0;
const common_1 = require("@nestjs/common");
const tenant_scoped_repository_1 = require("../../common/tenant/tenant-scoped.repository");
const voice_tokens_1 = require("./voice.tokens");
const secret_crypto_1 = require("../../common/crypto/secret-crypto");
let VoiceIntegrationsService = class VoiceIntegrationsService {
    constructor(repo) {
        this.repo = repo;
    }
    async getForCurrentTenant() {
        return this.repo.findOne({ where: {} });
    }
    async upsertForCurrentTenant(tenantId, data) {
        const existing = await this.repo.findOne({ where: {} });
        const patch = {
            twilio_account_sid: data.twilio_account_sid,
            twilio_api_key_sid: data.twilio_api_key_sid,
            twiml_app_sid: data.twiml_app_sid,
            voice_number: data.voice_number,
        };
        if (data.twilio_auth_token) {
            patch.twilio_auth_token_encrypted = (0, secret_crypto_1.encryptSecret)(data.twilio_auth_token);
        }
        if (data.twilio_api_key_secret) {
            patch.twilio_api_key_secret_encrypted = (0, secret_crypto_1.encryptSecret)(data.twilio_api_key_secret);
        }
        if (existing) {
            await this.repo.update(existing.id, patch);
            return this.repo.findOne({ where: { id: existing.id } });
        }
        if (!data.twilio_auth_token || !data.twilio_api_key_secret) {
            throw new Error('twilio_auth_token y twilio_api_key_secret son requeridos al crear la integración');
        }
        const entity = this.repo.create({
            ...patch,
            tenant_id: tenantId,
            is_active: true,
        });
        return this.repo.save(entity);
    }
    async getConfigForTenant(tenantId) {
        const integration = await this.repo.raw.findOne({ where: { tenant_id: tenantId, is_active: true } });
        if (!integration)
            return null;
        return {
            accountSid: integration.twilio_account_sid,
            authToken: (0, secret_crypto_1.decryptSecret)(integration.twilio_auth_token_encrypted),
            apiKeySid: integration.twilio_api_key_sid,
            apiKeySecret: (0, secret_crypto_1.decryptSecret)(integration.twilio_api_key_secret_encrypted),
            twimlAppSid: integration.twiml_app_sid,
            voiceNumber: integration.voice_number,
        };
    }
    async findTenantIdByVoiceNumber(voiceNumber) {
        const integration = await this.repo.raw.findOne({ where: { voice_number: voiceNumber, is_active: true } });
        return integration?.tenant_id || null;
    }
};
exports.VoiceIntegrationsService = VoiceIntegrationsService;
exports.VoiceIntegrationsService = VoiceIntegrationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(voice_tokens_1.VOICE_INTEGRATION_REPO)),
    __metadata("design:paramtypes", [tenant_scoped_repository_1.TenantScopedRepository])
], VoiceIntegrationsService);
//# sourceMappingURL=voice-integrations.service.js.map