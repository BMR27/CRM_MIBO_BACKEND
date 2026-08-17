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
exports.TwilioController = void 0;
const common_1 = require("@nestjs/common");
const twilio_service_1 = require("./twilio.service");
const messages_service_1 = require("../modules/messages/messages.service");
const jwt_auth_guard_1 = require("../modules/auth/guards/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let TwilioController = class TwilioController {
    constructor(twilioService, messagesService) {
        this.twilioService = twilioService;
        this.messagesService = messagesService;
    }
    /**
     * Endpoint para obtener plantillas aprobadas de WhatsApp en Twilio
     * POST /api/twilio/wa-templates { serviceSid }
     */
    async getApprovedWATemplates(body) {
        try {
            // Si se recibe serviceSid, pásalo al servicio
            return await this.twilioService.listApprovedWATemplates(body?.serviceSid);
        }
        catch (err) {
            console.error('Error obteniendo plantillas Twilio:', err?.response?.data || err?.message || err);
            throw { statusCode: 500, message: err?.response?.data?.message || err?.message || 'Internal server error' };
        }
    }
    async sendWATemplate(body) {
        // body: { to, from, contentSid, variables, conversation_id, sender_id }
        let twilioResult;
        if (body.contentSid) {
            twilioResult = await this.twilioService.sendWhatsAppTemplateViaHttp(body);
        }
        else {
            twilioResult = await this.twilioService.sendWhatsAppTemplate(body);
        }
        // Registrar mensaje en la conversación si se provee conversation_id
        if (body.conversation_id) {
            // Obtener el texto real enviado por Twilio
            let sentText = '';
            if (twilioResult && twilioResult.body) {
                sentText = twilioResult.body;
            }
            else if (twilioResult && twilioResult.message && twilioResult.message.body) {
                sentText = twilioResult.message.body;
            }
            else {
                sentText = body.variables && body.variables.length > 0 ? body.variables[0] : 'Plantilla enviada';
            }
            await this.messagesService.create({
                conversation_id: body.conversation_id,
                sender_type: 'agent',
                sender_id: body.sender_id || null,
                content: sentText,
                message_type: 'text',
                is_from_whatsapp: true,
                metadata: { twilio: twilioResult },
            });
        }
        return { success: true, twilio: twilioResult };
    }
    async sendWAMedia(body) {
        const to = String(body?.to || '').trim();
        const from = String(body?.from || (await this.twilioService.getDefaultWhatsappFrom()) || '').trim();
        const mediaUrl = String(body?.mediaUrl || '').trim();
        const textBody = typeof body?.body === 'string' ? body.body : undefined;
        if (!to || !mediaUrl) {
            throw { statusCode: 400, message: 'to and mediaUrl are required' };
        }
        const twilioResult = await this.twilioService.sendWhatsAppMedia({
            to,
            from,
            mediaUrl,
            body: textBody,
        });
        return { success: true, twilio: twilioResult };
    }
    optionsSendWaTemplate() {
        return {};
    }
    optionsSendWaMedia() {
        return {};
    }
    async getMediaByMessage(messageSid, filename, res) {
        try {
            const result = await this.twilioService.downloadFirstMediaByMessageSid(messageSid);
            const safeFilename = (filename || '').trim();
            res.setHeader('Content-Type', result.contentType || 'application/octet-stream');
            res.setHeader('Cache-Control', 'private, no-store');
            if (safeFilename) {
                res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
            }
            else if (result.contentDisposition) {
                res.setHeader('Content-Disposition', result.contentDisposition);
            }
            res.status(200).send(result.data);
        }
        catch (error) {
            res.status(404).json({
                error: 'Media not found for message',
                details: error?.message || 'Unknown error',
            });
        }
    }
};
exports.TwilioController = TwilioController;
__decorate([
    (0, common_1.Post)('wa-templates'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener plantillas aprobadas de WhatsApp en Twilio' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                serviceSid: { type: 'string', example: 'ISxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TwilioController.prototype, "getApprovedWATemplates", null);
__decorate([
    (0, common_1.Post)('send-wa-template'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar plantilla WhatsApp por Twilio' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                to: { type: 'string', example: 'whatsapp:+525512345678' },
                from: { type: 'string', example: 'whatsapp:+14155238886' },
                contentSid: { type: 'string', example: 'HXdf73cf1db9d8dc586d94d576fa2e140c' },
                variables: { type: 'array', items: { type: 'string' }, example: ['Juan Pérez', 'Producto'] },
                conversation_id: { type: 'string', example: 'uuid-conversacion' },
                sender_id: { type: 'string', example: 'uuid-agente' },
            },
            required: ['to', 'contentSid'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Plantilla enviada' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TwilioController.prototype, "sendWATemplate", null);
__decorate([
    (0, common_1.Post)('send-wa-media'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Enviar media por WhatsApp vía Twilio' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                to: { type: 'string', example: 'whatsapp:+525512345678' },
                from: { type: 'string', example: 'whatsapp:+14155238886' },
                mediaUrl: { type: 'string', example: 'https://example.com/documento.pdf' },
                body: { type: 'string', example: 'Documento adjunto' },
            },
            required: ['to', 'mediaUrl'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TwilioController.prototype, "sendWAMedia", null);
__decorate([
    (0, common_1.Options)('send-wa-template'),
    (0, swagger_1.ApiOperation)({ summary: 'Preflight CORS para envío de plantilla' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TwilioController.prototype, "optionsSendWaTemplate", null);
__decorate([
    (0, common_1.Options)('send-wa-media'),
    (0, swagger_1.ApiOperation)({ summary: 'Preflight CORS para envío de media' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TwilioController.prototype, "optionsSendWaMedia", null);
__decorate([
    (0, common_1.Get)('media-by-message/:messageSid'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Descargar primer archivo media asociado a un mensaje Twilio' }),
    (0, swagger_1.ApiParam)({ name: 'messageSid', description: 'SID del mensaje Twilio', example: 'SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }),
    (0, swagger_1.ApiQuery)({ name: 'filename', required: false, description: 'Nombre sugerido para responder Content-Disposition' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Archivo media binario' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Media no encontrada' }),
    __param(0, (0, common_1.Param)('messageSid')),
    __param(1, (0, common_1.Query)('filename')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TwilioController.prototype, "getMediaByMessage", null);
exports.TwilioController = TwilioController = __decorate([
    (0, swagger_1.ApiTags)('Twilio - WhatsApp Templates y Media'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('twilio'),
    __metadata("design:paramtypes", [twilio_service_1.TwilioService,
        messages_service_1.MessagesService])
], TwilioController);
//# sourceMappingURL=twilio.controller.js.map