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
const CUSTOMER_SERVICE_TEMPLATE_SID = 'HXf9420e6e4ff17a94fe3dfaceb7aa657b';
const CUSTOMER_SERVICE_TEMPLATE_BODY = '¡Hola, {{1}}! Mi nombre es {{2}} y lo contacto del departamento de atención al cliente del producto {{3}}. ¡Estoy a disposición para asistir!';
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const XLSX = __importStar(require("xlsx"));
const twilio_service_1 = require("../../twilio/twilio.service");
const contacts_service_1 = require("../contacts/contacts.service");
const conversations_service_1 = require("../conversations/conversations.service");
const messages_service_1 = require("./messages.service");
const swagger_1 = require("@nestjs/swagger");
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
        // En producción solo se permite la plantilla autorizada para campañas masivas.
        const contentSid = CUSTOMER_SERVICE_TEMPLATE_SID;
        const campaignId = String(body.campaignId || `bulk_${Date.now()}`);
        const campaignName = String(body.campaignName || 'Campaña').trim() || 'Campaña';
        const campaignCode = String(body.campaignCode || campaignId).trim() || campaignId;
        const from = process.env.TWILIO_WHATSAPP_FROM;
        const results = [];
        for (const row of data) {
            try {
                const to = String(row.telefono || row.PHONE_A || row.phone || row.telefono_cliente || '').trim();
                if (!to) {
                    throw new Error('Contacto sin telefono/PHONE_A');
                }
                // 1. Buscar o crear contacto
                let contact = await this.contactsService.findByPhoneNumber(to);
                if (!contact) {
                    contact = await this.contactsService.create({
                        phone_number: to,
                        name: row.CLIENTE || row.nombre || to,
                    });
                }
                // 2. Buscar o crear conversación
                let conversations = await this.conversationsService.findByContact(contact.id);
                let conversation;
                if (conversations && conversations.length > 0) {
                    conversation = conversations[0];
                }
                else {
                    // Asignar el agente logueado
                    const assigned_agent_id = req?.user?.id;
                    console.log('Agente asignado a la conversación:', assigned_agent_id);
                    conversation = await this.conversationsService.create({ contact_id: contact.id, assigned_agent_id });
                }
                // 3. Enviar mensaje por WhatsApp
                const cliente = String(row.CLIENTE || row.nombre || 'Usuario').trim() || 'Usuario';
                const asesor = String(row.ASESOR || req?.user?.name || req?.user?.email || 'Agente').trim() || 'Agente';
                const producto = String(row.PRODUCTOS_A || row.PRODUCTS_A || row.producto || '').trim();
                const variablesToSend = [cliente, asesor, producto];
                // Log explícito para depuración
                console.log('Variables enviadas a Twilio:', variablesToSend);
                const res = await this.twilioService.sendWhatsAppTemplate({
                    to,
                    from,
                    contentSid,
                    variables: variablesToSend,
                });
                results.push({ to, status: 'sent', sid: res.sid });
                console.log(`Mensaje enviado a ${to}: SID ${res.sid}`);
                // 4. Registrar mensaje en la conversación usando la plantilla y parámetros
                const mensajePlantilla = CUSTOMER_SERVICE_TEMPLATE_BODY
                    .replace('{{1}}', cliente)
                    .replace('{{2}}', asesor)
                    .replace('{{3}}', producto);
                await this.messagesService.create({
                    conversation_id: conversation.id,
                    sender_type: 'agent',
                    content: mensajePlantilla,
                    message_type: 'text',
                    is_from_whatsapp: false,
                    whatsapp_message_id: res.sid,
                    metadata: {
                        campaignId,
                        campaignName,
                        campaignCode,
                        templateSid: contentSid,
                        source: 'bulk',
                        send: {
                            ok: true,
                            externalMessageId: res.sid,
                            to,
                        },
                    },
                    created_at: new Date(),
                });
            }
            catch (err) {
                const errorTo = String(row.telefono || row.PHONE_A || row.phone || row.telefono_cliente || '').trim();
                results.push({ to: errorTo, status: 'error', error: err.message });
                console.log(`Error enviando a ${errorTo}:`, err.message);
            }
        }
        console.log('Resultados de envío masivo:', results);
        return { success: true, rows: data.length, results, preview: data };
    }
};
exports.MessagesBulkController = MessagesBulkController;
__decorate([
    (0, common_1.Post)('bulk'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiOperation)({
        summary: 'Enviar mensajes masivos por WhatsApp',
        description: 'Recibe contactos por JSON o archivo Excel, envía una plantilla aprobada por Twilio y registra la conversación/mensaje con metadata de campaña.',
    }),
    (0, swagger_1.ApiConsumes)('application/json', 'multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            oneOf: [
                {
                    type: 'object',
                    properties: {
                        campaignId: { type: 'string', example: 'bulk_1710000000000' },
                        campaignCode: { type: 'string', example: 'CMP-20260612094500' },
                        campaignName: { type: 'string', example: 'Recuperación entregas junio' },
                        campaignNotes: { type: 'string', example: 'Segmento de pedidos pendientes' },
                        templateSid: { type: 'string', example: CUSTOMER_SERVICE_TEMPLATE_SID },
                        contacts: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    CLIENTE: { type: 'string', example: 'Juan Pérez' },
                                    PHONE_A: { type: 'string', example: '+525512345678' },
                                    ORDEN: { type: 'string', example: 'ORD-123' },
                                    PRODUCTS_A: { type: 'string', example: 'Producto de prueba' },
                                },
                            },
                        },
                    },
                    required: ['templateSid', 'contacts'],
                },
                {
                    type: 'object',
                    properties: {
                        file: { type: 'string', format: 'binary' },
                        templateSid: { type: 'string' },
                        campaignName: { type: 'string' },
                    },
                    required: ['file', 'templateSid'],
                },
            ],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Resultado del envío masivo',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                rows: { type: 'number', example: 25 },
                results: { type: 'array', items: { type: 'object' } },
            },
        },
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], MessagesBulkController.prototype, "uploadBulk", null);
exports.MessagesBulkController = MessagesBulkController = __decorate([
    (0, swagger_1.ApiTags)('Bulk Messages - Envíos masivos'),
    (0, swagger_1.ApiBearerAuth)(),
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