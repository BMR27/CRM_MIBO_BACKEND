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
exports.TenantsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenants_service_1 = require("./tenants.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const platform_admin_guard_1 = require("../../common/auth/platform-admin.guard");
let TenantsController = class TenantsController {
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
    }
    async getAll() {
        return this.tenantsService.findAll();
    }
    async getMe(req) {
        const tenant = await this.tenantsService.findById(req.user.tenantId);
        return tenant;
    }
    async updateMe(req, body) {
        if (req.user.role !== 'admin') {
            throw new common_1.ForbiddenException('Solo un administrador puede renombrar el espacio de trabajo');
        }
        const name = String(body.name || '').trim();
        if (!name) {
            throw new common_1.BadRequestException('El nombre no puede estar vacío');
        }
        return this.tenantsService.renameTenant(req.user.tenantId, name);
    }
    async updateFeatures(req, body) {
        if (req.user.role !== 'admin') {
            throw new common_1.ForbiddenException('Solo un administrador puede cambiar las funciones habilitadas del espacio');
        }
        return this.tenantsService.updateFeatureFlags(req.user.tenantId, body);
    }
    async getWebhook(req) {
        if (req.user.role !== 'admin') {
            throw new common_1.ForbiddenException('Solo un administrador puede ver la configuración de webhooks');
        }
        const tenant = await this.tenantsService.findById(req.user.tenantId);
        return {
            webhook_url: tenant?.webhook_url || null,
            webhook_events_enabled: tenant?.webhook_events_enabled || false,
            has_secret: Boolean(tenant?.webhook_secret_encrypted),
        };
    }
    async updateWebhook(req, body) {
        if (req.user.role !== 'admin') {
            throw new common_1.ForbiddenException('Solo un administrador puede configurar el webhook del espacio');
        }
        const { tenant, plainSecret } = await this.tenantsService.updateWebhookConfig(req.user.tenantId, body);
        return {
            webhook_url: tenant.webhook_url,
            webhook_events_enabled: tenant.webhook_events_enabled,
            has_secret: Boolean(tenant.webhook_secret_encrypted),
            ...(plainSecret
                ? {
                    webhook_secret: plainSecret,
                    warning: 'Guarda este secreto ahora: no volverá a mostrarse completo.',
                }
                : {}),
        };
    }
    async rotateWebhookSecret(req) {
        if (req.user.role !== 'admin') {
            throw new common_1.ForbiddenException('Solo un administrador puede rotar el secreto del webhook');
        }
        const plainSecret = await this.tenantsService.rotateWebhookSecret(req.user.tenantId);
        return {
            webhook_secret: plainSecret,
            warning: 'Guarda este secreto ahora: no volverá a mostrarse completo.',
        };
    }
};
exports.TenantsController = TenantsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(platform_admin_guard_1.PlatformAdminGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos los espacios de trabajo (solo super-admin de plataforma)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener el tenant (espacio de trabajo) del usuario autenticado' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getMe", null);
__decorate([
    (0, common_1.Patch)('me'),
    (0, swagger_1.ApiOperation)({ summary: 'Renombrar el espacio de trabajo (solo admin)' }),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { name: { type: 'string', example: 'Mi Empresa' } }, required: ['name'] } }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Patch)('me/features'),
    (0, swagger_1.ApiOperation)({ summary: 'Habilitar/deshabilitar mensajería masiva y plantillas de WhatsApp para el espacio (solo admin)' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                bulk_messaging_enabled: { type: 'boolean' },
                wa_templates_enabled: { type: 'boolean' },
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "updateFeatures", null);
__decorate([
    (0, common_1.Get)('me/webhook'),
    (0, swagger_1.ApiOperation)({ summary: 'Ver configuración de webhook saliente del espacio (solo admin)' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "getWebhook", null);
__decorate([
    (0, common_1.Patch)('me/webhook'),
    (0, swagger_1.ApiOperation)({
        summary: 'Configurar webhook saliente del espacio (solo admin)',
        description: 'Registra la URL donde este espacio quiere recibir eventos de estado de mensajes de WhatsApp ' +
            '(enviado, entregado, leído, fallido). Al habilitarlo por primera vez se genera un secreto de firma ' +
            'que se devuelve una sola vez en la respuesta (campo webhook_secret): guárdalo, no se puede volver a mostrar.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                webhook_url: { type: 'string', nullable: true, example: 'https://miempresa.com/webhooks/mibo' },
                enabled: { type: 'boolean', example: true },
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "updateWebhook", null);
__decorate([
    (0, common_1.Post)('me/webhook/rotate-secret'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Rotar el secreto de firma del webhook saliente (solo admin)',
        description: 'Invalida el secreto anterior y devuelve uno nuevo una sola vez.',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantsController.prototype, "rotateWebhookSecret", null);
exports.TenantsController = TenantsController = __decorate([
    (0, swagger_1.ApiTags)('Tenants - Espacio de trabajo'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tenants'),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantsController);
//# sourceMappingURL=tenants.controller.js.map