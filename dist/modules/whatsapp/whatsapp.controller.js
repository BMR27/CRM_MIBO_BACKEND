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
const config_1 = require("@nestjs/config");
const whatsapp_service_1 = require("./whatsapp.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
let WhatsappController = class WhatsappController {
    constructor(whatsappService, configService) {
        this.whatsappService = whatsappService;
        this.configService = configService;
    }
    /**
     * Webhook para recibir mensajes desde Twilio
     */
    async verifyWebhook(mode, token, challenge) {
        const verifyToken = this.configService.get('WHATSAPP_VERIFY_TOKEN');
        if (mode === 'subscribe' && token && verifyToken && token === verifyToken) {
            return challenge;
        }
        throw new common_1.HttpException('Forbidden', common_1.HttpStatus.FORBIDDEN);
    }
    async handleWebhook(body) {
        await this.whatsappService.handleWebhook(body);
        return { success: true };
    }
    /**
     * Health check - Verificar conexión con Twilio
     */
    async healthCheck() {
        return this.whatsappService.healthCheck();
    }
    /**
     * Enviar mensaje de texto por WhatsApp
     */
    async sendMessage(body) {
        return this.whatsappService.sendMessage(body.phone_number, body.message);
    }
    /**
     * Enviar mensaje con plantilla
     */
    async sendTemplate(body) {
        return this.whatsappService.sendTemplateMessage(body.phone_number, body.template_name, body.parameters);
    }
    /**
     * Enviar mensaje con media (Cloud API)
     */
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
    /**
     * Descargar/visualizar media desde WhatsApp Cloud API (proxy)
     */
    async downloadMedia(mediaId, filename, res) {
        const result = await this.whatsappService.downloadCloudMedia(mediaId, {
            filename,
        });
        if (result.contentType) {
            res.setHeader('Content-Type', result.contentType);
        }
        if (result.contentDisposition) {
            res.setHeader('Content-Disposition', result.contentDisposition);
        }
        return new common_1.StreamableFile(result.stream);
    }
    /**
     * Obtener estado de un mensaje
     */
    async getMessageStatus(messageId) {
        return this.whatsappService.getMessageStatus(messageId);
    }
    /**
     * Obtener números de teléfono disponibles
     */
    async getPhoneNumbers() {
        return this.whatsappService.getPhoneNumbers();
    }
};
exports.WhatsappController = WhatsappController;
__decorate([
    (0, common_1.Get)('webhook'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Verificar webhook de WhatsApp Cloud API',
        description: 'Endpoint de verificación de Meta (hub.challenge). Se usa al guardar el webhook en el panel de Meta.',
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
            'Twilio envía datos en formato form-encoded, Cloud API envía JSON.',
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
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Mensaje recibido y procesado correctamente',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Verificar estado de conexión',
        description: 'Comprueba que la conexión con Twilio está activa y las credenciales son válidas. ' +
            'Sin autenticación requerida. Perfecto para monitoreo.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Conexión activa con Twilio',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                accountSid: { type: 'string', example: 'ACxxxxxxxxxxxxxxxxxx' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Error en la conexión',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                error: { type: 'string', example: 'No account found' },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "healthCheck", null);
__decorate([
    (0, common_1.Post)('send'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Enviar mensaje de texto',
        description: 'Envía un mensaje de texto a un número de WhatsApp. ' +
            'Requiere JWT autenticado. El número puede estar con o sin prefijo "whatsapp:+".',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                phone_number: {
                    type: 'string',
                    example: '+34612345678',
                    description: 'Número del destinatario con código de país',
                },
                message: {
                    type: 'string',
                    example: 'Hola, este es un mensaje de prueba',
                    description: 'Contenido del mensaje',
                },
            },
            required: ['phone_number', 'message'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Mensaje enviado exitosamente',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                whatsapp_message_id: {
                    type: 'string',
                    example: 'SM1234567890abcdef',
                    description: 'ID de Twilio para rastrear el mensaje',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Error al enviar',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                error: {
                    type: 'string',
                    example: 'Invalid phone number format',
                },
            },
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
    (0, swagger_1.ApiOperation)({
        summary: 'Enviar mensaje con plantilla',
        description: 'Envía un mensaje usando un template. ' +
            'Si WHATSAPP_ACCESS_TOKEN y WHATSAPP_PHONE_NUMBER_ID están configurados, se envía como template real de WhatsApp Cloud API (requerido fuera de la ventana de 24h). ' +
            'Si no, hace fallback y envía texto plano (Twilio o sin Cloud API).',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                phone_number: {
                    type: 'string',
                    example: '+34612345678',
                    description: 'Número del destinatario',
                },
                template_name: {
                    type: 'string',
                    example: 'order_confirmation',
                    description: 'Nombre de la plantilla',
                },
                parameters: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['#12345', 'Juan Pérez'],
                    description: 'Parámetros para la plantilla (opcional)',
                },
            },
            required: ['phone_number', 'template_name'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Mensaje enviado',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                whatsapp_message_id: { type: 'string' },
            },
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
    (0, swagger_1.ApiOperation)({
        summary: 'Enviar media (imagen/documento/audio/video/sticker)',
        description: 'Envía un archivo como media usando WhatsApp Cloud API. ' +
            'Requiere WHATSAPP_ACCESS_TOKEN y WHATSAPP_PHONE_NUMBER_ID configurados. ' +
            'El archivo se sube primero a /{phone_number_id}/media y luego se envía el mensaje referenciando el media_id.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                phone_number: {
                    type: 'string',
                    example: '+5215548780484',
                    description: 'Número del destinatario (E.164)',
                },
                type: {
                    type: 'string',
                    enum: ['image', 'document', 'audio', 'video', 'sticker'],
                    example: 'image',
                },
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
    (0, swagger_1.ApiOperation)({
        summary: 'Descargar/visualizar media (proxy Cloud API)',
        description: 'Dado un media_id de WhatsApp Cloud API, obtiene la URL de descarga y hace proxy del binario. ' +
            'Útil para mostrar imágenes/documentos/audios/videos/stickers en el CRM sin exponer el access token.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'filename',
        required: false,
        description: 'Nombre sugerido para Content-Disposition',
        example: 'archivo.pdf',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'token',
        required: false,
        description: 'JWT opcional por query param. Útil para renderizar media en <img src>/<a href> cuando no se puede enviar Authorization header.',
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Binario del media' }),
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
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener estado de mensaje',
        description: 'Consulta el estado actual de un mensaje enviado. ' +
            'Posibles estados: accepted, queued, sending, sent, failed, delivered, undelivered, read.',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'message_id',
        type: 'string',
        description: 'ID de Twilio del mensaje (MessageSid)',
        example: 'SM1234567890abcdef',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Estado obtenido',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                status: {
                    type: 'string',
                    example: 'sent',
                    description: 'Estado del mensaje: accepted | queued | sending | sent | failed | delivered | read',
                },
            },
        },
    }),
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
    (0, swagger_1.ApiOperation)({
        summary: 'Listar números de WhatsApp',
        description: 'Obtiene todos los números de WhatsApp Business asociados a tu cuenta de Twilio. ' +
            'Estos son los números desde los que puedes enviar mensajes.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de números obtenida',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                numbers: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['+14155238886', '+14155238887'],
                    description: 'Números de WhatsApp disponibles',
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "getPhoneNumbers", null);
exports.WhatsappController = WhatsappController = __decorate([
    (0, swagger_1.ApiTags)('WhatsApp - Twilio/Cloud Integration'),
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [whatsapp_service_1.WhatsappService,
        config_1.ConfigService])
], WhatsappController);
//# sourceMappingURL=whatsapp.controller.js.map