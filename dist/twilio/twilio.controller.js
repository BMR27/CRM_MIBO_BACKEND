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
const contacts_service_1 = require("../modules/contacts/contacts.service");
const conversations_service_1 = require("../modules/conversations/conversations.service");
const jwt_auth_guard_1 = require("../modules/auth/guards/jwt-auth.guard");
const tenant_feature_guard_1 = require("../common/tenant/tenant-feature.guard");
const swagger_1 = require("@nestjs/swagger");
let TwilioController = class TwilioController {
    constructor(twilioService, messagesService, contactsService, conversationsService) {
        this.twilioService = twilioService;
        this.messagesService = messagesService;
        this.contactsService = contactsService;
        this.conversationsService = conversationsService;
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
        // Registrar el mensaje en la conversación: si no se provee conversation_id (p.ej.
        // clientes externos usando la API directamente), resolvemos/creamos el contacto y la
        // conversación a partir del número "to" para que el mensaje quede visible en la interfaz.
        let conversationId = body.conversation_id;
        if (!conversationId && body.to) {
            const contact = await this.contactsService.findOrCreateByPhone(body.to);
            const conversations = await this.conversationsService.findByContact(contact.id);
            const conversation = conversations && conversations.length > 0
                ? conversations[0]
                : await this.conversationsService.create({ contact_id: contact.id });
            conversationId = conversation.id;
        }
        if (conversationId) {
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
            const sid = twilioResult?.sid || twilioResult?.message?.sid || null;
            await this.messagesService.create({
                conversation_id: conversationId,
                sender_type: 'agent',
                sender_id: body.sender_id || null,
                content: sentText,
                message_type: 'text',
                is_from_whatsapp: true,
                whatsapp_message_id: sid,
                metadata: { twilio: twilioResult },
            });
            await this.conversationsService.update(conversationId, {
                last_message_at: new Date(),
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
    /**
     * Twilio llama a esta URL (sin autenticación JWT: la usa su infraestructura, no un
     * cliente de nuestra API) cada vez que cambia el estado de un mensaje enviado con
     * statusCallback/StatusCallback configurado. El tenantId va en el path porque lo
     * definimos nosotros mismos al armar esa URL en TwilioService.getStatusCallbackUrl().
     */
    async statusCallback(tenantId, body) {
        return this.twilioService.handleStatusCallback(tenantId, body || {});
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
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_feature_guard_1.TenantFeatureGuard),
    (0, tenant_feature_guard_1.RequireTenantFeature)('wa_templates_enabled'),
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
    (0, common_1.Post)('status-callback/:tenantId'),
    (0, swagger_1.ApiExcludeEndpoint)(),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TwilioController.prototype, "statusCallback", null);
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
        messages_service_1.MessagesService,
        contacts_service_1.ContactsService,
        conversations_service_1.ConversationsService])
], TwilioController);
//# sourceMappingURL=twilio.controller.js.map