"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesBulkController = void 0;
// Helper para limpiar el nombre (fuera de la clase)
function getNombreSinNumero(nombre) {
    if (!nombre)
        return 'Usuario';
    // Elimina números al inicio del nombre
    return nombre.replace(/^\d+\s*/, '').trim();
}
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const XLSX = __importStar(require("xlsx"));
const twilio_service_1 = require("../../twilio/twilio.service");
const contacts_service_1 = require("../contacts/contacts.service");
const conversations_service_1 = require("../conversations/conversations.service");
const messages_service_1 = require("./messages.service");
let MessagesBulkController = class MessagesBulkController {
    constructor(twilioService, contactsService, conversationsService, messagesService) {
        this.twilioService = twilioService;
        this.contactsService = contactsService;
        this.conversationsService = conversationsService;
        this.messagesService = messagesService;
    }
    async uploadBulk(file, body, req) {
        let data = [];
        // Si se envía archivo Excel
        if (file) {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            data = XLSX.utils.sheet_to_json(sheet);
            console.log('Contactos importados desde Excel:', data);
        }
        // Si se envía JSON en el body
        else if (body && Array.isArray(body.contacts)) {
            data = body.contacts;
            console.log('Contactos importados desde JSON body:', data);
        }
        // Si se envía JSON sin Content-Type correcto (por ejemplo, desde fetch)
        else if (req && req.body && Array.isArray(req.body.contacts)) {
            data = req.body.contacts;
            console.log('Contactos importados desde req.body:', data);
        }
        if (!data || data.length === 0) {
            console.log('No contacts provided');
            return { error: 'No contacts provided' };
        }
        // Configuración de la plantilla aprobada
        const contentSid = 'HX99ead19f74793c6b5f0e1777523f1815'; // bienvenido_logi
        const from = process.env.TWILIO_WHATSAPP_FROM;
        const results = [];
        for (const row of data) {
            try {
                const to = String(row.telefono);
                // 1. Buscar o crear contacto
                let contact = await this.contactsService.findByPhoneNumber(to);
                if (!contact) {
                    contact = await this.contactsService.create({
                        phone_number: to,
                        name: row.nombre || to,
                    });
                }
                // 2. Buscar o crear conversación
                let conversations = await this.conversationsService.findByContact(contact.id);
                let conversation;
                if (conversations && conversations.length > 0) {
                    conversation = conversations[0];
                }
                else {
                    conversation = await this.conversationsService.create({ contact_id: contact.id });
                }
                // 3. Enviar mensaje por WhatsApp
                const res = await this.twilioService.sendWhatsAppTemplate({
                    to,
                    from,
                    contentSid,
                    variables: [row.nombre || 'Usuario'],
                });
                results.push({ to, status: 'sent', sid: res.sid });
                console.log(`Mensaje enviado a ${to}: SID ${res.sid}`);
                // 4. Registrar mensaje en la conversación
                await this.messagesService.create({
                    conversation_id: conversation.id,
                    sender_type: 'agent',
                    content: `Hola ${row.nombre || 'Usuario'} 👋\n¡Bienvenido/a! Estoy aquí para ayudarte con tus pedidos y soporte.`,
                    message_type: 'text',
                    is_from_whatsapp: false,
                    whatsapp_message_id: res.sid,
                });
            }
            catch (err) {
                results.push({ to: String(row.telefono), status: 'error', error: err.message });
                console.log(`Error enviando a ${row.telefono}:`, err.message);
            }
        }
        console.log('Resultados de envío masivo:', results);
        return { success: true, rows: data.length, results, preview: data };
    }
};
exports.MessagesBulkController = MessagesBulkController;
__decorate([
    (0, common_1.Post)('bulk'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], MessagesBulkController.prototype, "uploadBulk", null);
exports.MessagesBulkController = MessagesBulkController = __decorate([
    (0, common_1.Controller)('messages'),
    __param(0, (0, common_1.Inject)(twilio_service_1.TwilioService)),
    __param(1, (0, common_1.Inject)(contacts_service_1.ContactsService)),
    __param(2, (0, common_1.Inject)(conversations_service_1.ConversationsService)),
    __param(3, (0, common_1.Inject)(messages_service_1.MessagesService)),
    __metadata("design:paramtypes", [twilio_service_1.TwilioService,
        contacts_service_1.ContactsService,
        conversations_service_1.ConversationsService,
        messages_service_1.MessagesService])
], MessagesBulkController);
//# sourceMappingURL=messages.bulk.controller.js.map