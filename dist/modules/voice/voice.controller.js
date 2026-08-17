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
exports.VoiceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const voice_service_1 = require("./voice.service");
const voice_integrations_service_1 = require("./voice-integrations.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_context_1 = require("../../common/tenant/tenant-context");
let VoiceController = class VoiceController {
    constructor(voiceService, integrationsService) {
        this.voiceService = voiceService;
        this.integrationsService = integrationsService;
    }
    async getToken(req) {
        return this.voiceService.generateAccessToken(req.user.id);
    }
    async twimlOutgoing(body) {
        const tenantId = body.tenantId;
        const to = body.To;
        if (!tenantId || !to) {
            return '<Response><Say>Llamada inválida</Say></Response>';
        }
        return tenant_context_1.TenantContext.run({ tenantId }, async () => {
            return this.voiceService.buildOutgoingTwiml(to);
        });
    }
    async twimlIncoming(body) {
        const to = String(body?.To || '').trim();
        const tenantId = to ? await this.voiceService.resolveTenantForIncoming(to) : null;
        if (!tenantId) {
            return '<Response><Say>Número no configurado</Say></Response>';
        }
        await tenant_context_1.TenantContext.run({ tenantId }, async () => {
            await this.voiceService.logIncomingCall({
                tenantId,
                from: String(body?.From || ''),
                to,
                callSid: String(body?.CallSid || ''),
            });
        });
        return this.voiceService.buildIncomingTwiml(tenantId);
    }
    async statusWebhook(body) {
        if (body?.CallSid && body?.CallStatus) {
            await this.voiceService.updateStatusByCallSid(body.CallSid, body.CallStatus, body.CallDuration ? Number(body.CallDuration) : undefined);
        }
        return { success: true };
    }
    async getIntegration() {
        const integration = await this.integrationsService.getForCurrentTenant();
        if (!integration)
            return null;
        return {
            twilio_account_sid: integration.twilio_account_sid,
            twilio_api_key_sid: integration.twilio_api_key_sid,
            twiml_app_sid: integration.twiml_app_sid,
            voice_number: integration.voice_number,
            is_active: integration.is_active,
        };
    }
    async saveIntegration(req, body) {
        const integration = await this.integrationsService.upsertForCurrentTenant(req.user.tenantId, body);
        return {
            twilio_account_sid: integration.twilio_account_sid,
            voice_number: integration.voice_number,
            is_active: integration.is_active,
        };
    }
};
exports.VoiceController = VoiceController;
__decorate([
    (0, common_1.Post)('token'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener un Access Token de Twilio para inicializar el softphone del navegador' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VoiceController.prototype, "getToken", null);
__decorate([
    (0, common_1.Post)('twiml/outgoing'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'TwiML para llamadas salientes (lo invoca Twilio, no se llama directo)',
        description: 'El softphone del navegador manda `tenantId` como parámetro custom en device.connect({ params }), ' +
            'junto con el número a marcar (`To`) — así este endpoint, compartido por todos los tenants, sabe ' +
            'con qué credenciales/callerId responder.',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VoiceController.prototype, "twimlOutgoing", null);
__decorate([
    (0, common_1.Post)('twiml/incoming'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'TwiML para llamadas entrantes al número de voz del tenant (lo invoca Twilio)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VoiceController.prototype, "twimlIncoming", null);
__decorate([
    (0, common_1.Post)('webhook/status'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Callback de estado de llamada (lo invoca Twilio)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VoiceController.prototype, "statusWebhook", null);
__decorate([
    (0, common_1.Get)('integration'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener la configuración de Voice del tenant (sin secretos)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], VoiceController.prototype, "getIntegration", null);
__decorate([
    (0, common_1.Patch)('integration'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Guardar la configuración de Voice del tenant' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                twilio_account_sid: { type: 'string' },
                twilio_auth_token: { type: 'string' },
                twilio_api_key_sid: { type: 'string' },
                twilio_api_key_secret: { type: 'string' },
                twiml_app_sid: { type: 'string' },
                voice_number: { type: 'string' },
            },
            required: ['twilio_account_sid', 'twilio_api_key_sid', 'twiml_app_sid', 'voice_number'],
        },
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], VoiceController.prototype, "saveIntegration", null);
exports.VoiceController = VoiceController = __decorate([
    (0, swagger_1.ApiTags)('Voice - Llamadas (Twilio Voice / WebRTC)'),
    (0, common_1.Controller)('voice'),
    __metadata("design:paramtypes", [voice_service_1.VoiceService,
        voice_integrations_service_1.VoiceIntegrationsService])
], VoiceController);
//# sourceMappingURL=voice.controller.js.map