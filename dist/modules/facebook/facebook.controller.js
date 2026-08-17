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
exports.FacebookController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const facebook_service_1 = require("./facebook.service");
const facebook_integrations_service_1 = require("./facebook-integrations.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const tenant_context_1 = require("../../common/tenant/tenant-context");
let FacebookController = class FacebookController {
    constructor(facebookService, integrationsService) {
        this.facebookService = facebookService;
        this.integrationsService = integrationsService;
    }
    async verifyWebhook(mode, token, challenge) {
        const tenantId = token ? await this.facebookService.resolveTenantForVerifyToken(token) : null;
        if (mode === 'subscribe' && token && tenantId) {
            return challenge;
        }
        throw new common_1.HttpException('Forbidden', common_1.HttpStatus.FORBIDDEN);
    }
    async handleWebhook(body, res) {
        const tenantId = await this.facebookService.resolveTenantForWebhook(body);
        if (tenantId) {
            await tenant_context_1.TenantContext.run({ tenantId }, async () => {
                await this.facebookService.handleWebhook(body);
            });
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify({ success: true }));
    }
    async sendMessage(body) {
        return this.facebookService.sendMessage(body.psid, body.message);
    }
    async getIntegration() {
        const integration = await this.integrationsService.getForCurrentTenant();
        if (!integration)
            return null;
        return {
            page_id: integration.page_id,
            verify_token: integration.verify_token,
            is_active: integration.is_active,
            has_page_access_token: Boolean(integration.page_access_token_encrypted),
        };
    }
    async saveIntegration(req, body) {
        const integration = await this.integrationsService.upsertForCurrentTenant(req.user.tenantId, body);
        return {
            page_id: integration.page_id,
            verify_token: integration.verify_token,
            is_active: integration.is_active,
        };
    }
};
exports.FacebookController = FacebookController;
__decorate([
    (0, common_1.Get)('webhook'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Verificar webhook de Facebook Messenger (hub.challenge)' }),
    (0, swagger_1.ApiQuery)({ name: 'hub.mode', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'hub.verify_token', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'hub.challenge', required: false }),
    __param(0, (0, common_1.Query)('hub.mode')),
    __param(1, (0, common_1.Query)('hub.verify_token')),
    __param(2, (0, common_1.Query)('hub.challenge')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], FacebookController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Recibir mensajes de Facebook Messenger' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FacebookController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Post)('send'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar mensaje por Facebook Messenger' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: { psid: { type: 'string' }, message: { type: 'string' } },
            required: ['psid', 'message'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FacebookController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)('integration'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener la configuración de Facebook del tenant (sin secretos)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FacebookController.prototype, "getIntegration", null);
__decorate([
    (0, common_1.Patch)('integration'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Guardar la configuración de Facebook del tenant' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: { page_id: { type: 'string' }, page_access_token: { type: 'string' } },
            required: ['page_id'],
        },
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FacebookController.prototype, "saveIntegration", null);
exports.FacebookController = FacebookController = __decorate([
    (0, swagger_1.ApiTags)('Facebook - Messenger Integration'),
    (0, common_1.Controller)('facebook'),
    __metadata("design:paramtypes", [facebook_service_1.FacebookService,
        facebook_integrations_service_1.FacebookIntegrationsService])
], FacebookController);
//# sourceMappingURL=facebook.controller.js.map