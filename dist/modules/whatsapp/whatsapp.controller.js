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
exports.WhatsappController = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_service_1 = require("./whatsapp.service");
const whatsapp_integrations_service_1 = require("./whatsapp-integrations.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const tenant_context_1 = require("../../common/tenant/tenant-context");
const swagger_1 = require("@nestjs/swagger");
let WhatsappController = class WhatsappController {
    constructor(whatsappService, integrationsService) {
        this.whatsappService = whatsappService;
        this.integrationsService = integrationsService;
    }
    /**
     * Webhook para recibir mensajes desde Twilio
     */
    async verifyWebhook(mode, token, challenge) {
        const tenantId = token ? await this.whatsappService.resolveTenantForVerifyToken(token) : null;
        if (mode === 'subscribe' && token && tenantId) {
            return challenge;
        }
        throw new common_1.HttpException('Forbidden', common_1.HttpStatus.FORBIDDEN);
    }
    async handleWebhook(body, res) {
        const tenantId = await this.whatsappService.resolveTenantForWebhook(body);
        if (tenantId) {
            await tenant_context_1.TenantContext.run({ tenantId }, async () => {
                await this.whatsappService.handleWebhook(body);
            });
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send(JSON.stringify({ success: true }));
    }
    async healthCheck() {
        return this.whatsappService.healthCheck();
    }
    async sendMessage(body) {
        return this.whatsappService.sendMessage(body.phone_number, body.message);
    }
    async sendTemplate(body) {
        return this.whatsappService.sendTemplateMessage(body.phone_number, body.template_name, body.parameters);
    }
    async sendMedia(file, body) {
        if (!file?.buffer?.length) {
            throw new common_1.HttpException('file is required', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.whatsappService.sendMediaMessage(body.phone_number, {
            type: body.type,
            fileBuffer: file.buffer,
            mimeType: file.mimetype,
            filename: body.filename || file.originalname,
            caption: body.caption,
        });
    }
    async downloadMedia(mediaId, filename, res) {
        const result = await this.whatsappService.downloadCloudMedia(mediaId, { filename });
        if (result.contentType) {
            res.setHeader('Content-Type', result.contentType);
        }
        if (result.contentDisposition) {
            res.setHeader('Content-Disposition', result.contentDisposition);
        }
        return new common_1.StreamableFile(result.stream);
    }
    async getMessageStatus(messageId) {
        return this.whatsappService.getMessageStatus(messageId);
    }
    async getPhoneNumbers() {
        return this.whatsappService.getPhoneNumbers();
    }
    // --- Configuración de la integración por tenant ---
    async getIntegration(req) {
        const integration = await this.integrationsService.getForCurrentTenant();
        if (!integration)
            return null;
        return {
            provider: integration.provider,
            twilio_account_sid: integration.twilio_account_sid,
            twilio_whatsapp_number: integration.twilio_whatsapp_number,
            cloud_phone_number_id: integration.cloud_phone_number_id,
            cloud_waba_id: integration.cloud_waba_id,
            cloud_template_language: integration.cloud_template_language,
            verify_token: integration.verify_token,
            is_active: integration.is_active,
            has_twilio_auth_token: Boolean(integration.twilio_auth_token_encrypted),
            has_cloud_access_token: Boolean(integration.cloud_access_token_encrypted),
        };
    }
    async saveIntegration(req, body) {
        const integration = await this.integrationsService.upsertForCurrentTenant(req.user.tenantId, body);
        return {
            provider: integration.provider,
            verify_token: integration.verify_token,
            is_active: integration.is_active,
        };
    }
};
exports.WhatsappController = WhatsappController;
__decorate([
    (0, common_1.Get)('webhook'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Verificar webhook de WhatsApp Cloud API',
        description: 'Endpoint de verificación de Meta (hub.challenge). Se usa al guardar el webhook en el panel de Meta. ' +
            'El verify_token identifica a qué tenant pertenece la suscripción.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'hub.mode', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'hub.verify_token', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'hub.challenge', required: false }),
    __param(0, (0, common_1.Query)('hub.mode')),
    __param(1, (0, common_1.Query)('hub.verify_token')),
    __param(2, (0, common_1.Query)('hub.challenge')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Recibir mensajes de WhatsApp',
        description: 'Endpoint webhook para Twilio y WhatsApp Cloud API. ' +
            'Twilio envía datos en formato form-encoded, Cloud API envía JSON. El tenant se resuelve ' +
            'automáticamente por el AccountSid (Twilio) o phone_number_id (Cloud API).',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                MessageSid: { type: 'string', example: 'SM1234567890abcdef' },
                AccountSid: { type: 'string', example: 'ACxxxxxxxxxxxxxxxxxx' },
                From: { type: 'string', example: '+34612345678' },
                To: { type: 'string', example: '+14155238886' },
                Body: { type: 'string', example: 'Hola, ¿cómo estás?' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Mensaje recibido y procesado correctamente' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Verificar estado de conexión',
        description: 'Comprueba si el tenant autenticado tiene WhatsApp configurado y funcional.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Post)('send'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Enviar mensaje de texto',
        description: 'Envía un mensaje de texto a un número de WhatsApp usando la configuración del tenant autenticado.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                phone_number: { type: 'string', example: '+34612345678' },
                message: { type: 'string', example: 'Hola, este es un mensaje de prueba' },
            },
            required: ['phone_number', 'message'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('send-template'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar mensaje con plantilla' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                phone_number: { type: 'string', example: '+34612345678' },
                template_name: { type: 'string', example: 'order_confirmation' },
                parameters: { type: 'array', items: { type: 'string' }, example: ['#12345', 'Juan Pérez'] },
            },
            required: ['phone_number', 'template_name'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "sendTemplate", null);
__decorate([
    (0, common_1.Post)('send-media'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar media (imagen/documento/audio/video/sticker)' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                phone_number: { type: 'string', example: '+5215548780484' },
                type: { type: 'string', enum: ['image', 'document', 'audio', 'video', 'sticker'], example: 'image' },
                caption: { type: 'string', example: 'Mira esto' },
                filename: { type: 'string', example: 'archivo.pdf' },
                file: { type: 'string', format: 'binary' },
            },
            required: ['phone_number', 'type', 'file'],
        },
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "sendMedia", null);
__decorate([
    (0, common_1.Get)('media/:mediaId'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Descargar/visualizar media (proxy Cloud API)' }),
    (0, swagger_1.ApiQuery)({ name: 'filename', required: false }),
    __param(0, (0, common_1.Param)('mediaId')),
    __param(1, (0, common_1.Query)('filename')),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "downloadMedia", null);
__decorate([
    (0, common_1.Get)('message-status'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener estado de mensaje' }),
    (0, swagger_1.ApiQuery)({ name: 'message_id', type: 'string' }),
    __param(0, (0, common_1.Query)('message_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "getMessageStatus", null);
__decorate([
    (0, common_1.Get)('phone-numbers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Listar números de WhatsApp (Twilio)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "getPhoneNumbers", null);
__decorate([
    (0, common_1.Get)('integration'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener la configuración de WhatsApp del tenant (sin secretos)' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "getIntegration", null);
__decorate([
    (0, common_1.Patch)('integration'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Guardar la configuración de WhatsApp del tenant' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                provider: { type: 'string', enum: ['twilio', 'cloud_api'] },
                twilio_account_sid: { type: 'string' },
                twilio_auth_token: { type: 'string' },
                twilio_whatsapp_number: { type: 'string' },
                cloud_access_token: { type: 'string' },
                cloud_phone_number_id: { type: 'string' },
                cloud_waba_id: { type: 'string' },
                cloud_template_language: { type: 'string' },
            },
        },
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "saveIntegration", null);
exports.WhatsappController = WhatsappController = __decorate([
    (0, swagger_1.ApiTags)('WhatsApp - Twilio/Cloud Integration'),
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService,
        whatsapp_integrations_service_1.WhatsappIntegrationsService])
], WhatsappController);
//# sourceMappingURL=whatsapp.controller.js.map