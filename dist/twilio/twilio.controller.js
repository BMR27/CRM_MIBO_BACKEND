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
let TwilioController = class TwilioController {
    constructor(twilioService, messagesService) {
        this.twilioService = twilioService;
        this.messagesService = messagesService;
    }
    /**
     * Endpoint para obtener plantillas aprobadas de WhatsApp en Twilio
     * POST /api/twilio/wa-templates { serviceSid }
     */
    async getApprovedWATemplates() {
        return this.twilioService.listApprovedWATemplates();
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
                sender_type: 'user',
                sender_id: body.sender_id || null,
                content: sentText,
                message_type: 'text',
                is_from_whatsapp: true,
                metadata: { twilio: twilioResult },
            });
        }
        return { success: true, twilio: twilioResult };
    }
    optionsSendWaTemplate() {
        return {};
    }
};
exports.TwilioController = TwilioController;
__decorate([
    (0, common_1.Post)('wa-templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TwilioController.prototype, "getApprovedWATemplates", null);
__decorate([
    (0, common_1.Post)('send-wa-template'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TwilioController.prototype, "sendWATemplate", null);
__decorate([
    (0, common_1.Options)('send-wa-template'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TwilioController.prototype, "optionsSendWaTemplate", null);
exports.TwilioController = TwilioController = __decorate([
    (0, common_1.Controller)('twilio'),
    __metadata("design:paramtypes", [twilio_service_1.TwilioService,
        messages_service_1.MessagesService])
], TwilioController);
//# sourceMappingURL=twilio.controller.js.map