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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceService = void 0;
const common_1 = require("@nestjs/common");
const twilio_1 = __importDefault(require("twilio"));
const tenant_scoped_repository_1 = require("../../common/tenant/tenant-scoped.repository");
const voice_tokens_1 = require("./voice.tokens");
const tenant_context_1 = require("../../common/tenant/tenant-context");
const voice_integrations_service_1 = require("./voice-integrations.service");
const contacts_service_1 = require("../contacts/contacts.service");
const conversations_service_1 = require("../conversations/conversations.service");
const { AccessToken } = twilio_1.default.jwt;
const { VoiceGrant } = AccessToken;
const { VoiceResponse } = twilio_1.default.twiml;
let VoiceService = class VoiceService {
    constructor(callRepository, integrationsService, contactsService, conversationsService) {
        this.callRepository = callRepository;
        this.integrationsService = integrationsService;
        this.contactsService = contactsService;
        this.conversationsService = conversationsService;
    }
    async getConfig() {
        const tenantId = tenant_context_1.TenantContext.getTenantId();
        const config = await this.integrationsService.getConfigForTenant(tenantId);
        if (!config) {
            throw new common_1.BadRequestException('Voice (Twilio) no está configurado para este espacio de trabajo');
        }
        return config;
    }
    /** Access Token de corta duración para inicializar el SDK de Twilio Voice en el navegador. */
    async generateAccessToken(userId) {
        const tenantId = tenant_context_1.TenantContext.getTenantId();
        const config = await this.getConfig();
        const identity = `tenant-${tenantId}`;
        const accessToken = new AccessToken(config.accountSid, config.apiKeySid, config.apiKeySecret, {
            identity,
            ttl: 3600,
        });
        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: config.twimlAppSid,
            incomingAllow: true,
        });
        accessToken.addGrant(voiceGrant);
        return { token: accessToken.toJwt(), identity };
    }
    /** TwiML para una llamada saliente iniciada desde el navegador (device.connect()). */
    async buildOutgoingTwiml(to) {
        const config = await this.getConfig();
        const response = new VoiceResponse();
        const dial = response.dial({ callerId: config.voiceNumber });
        dial.number(to);
        return response.toString();
    }
    /** Resuelve tenant por el número de Twilio que recibió la llamada entrante. */
    async resolveTenantForIncoming(toNumber) {
        return this.integrationsService.findTenantIdByVoiceNumber(toNumber);
    }
    /** TwiML para una llamada entrante: suena en el identity compartido del tenant. */
    buildIncomingTwiml(tenantId) {
        const response = new VoiceResponse();
        const dial = response.dial();
        dial.client(`tenant-${tenantId}`);
        return response.toString();
    }
    async logIncomingCall(params) {
        let contactId = null;
        let conversationId = null;
        try {
            const contact = await this.contactsService.findByPhoneNumber(params.from);
            if (contact) {
                contactId = contact.id;
                const conversations = await this.conversationsService.findByContact(contact.id);
                if (conversations?.length)
                    conversationId = conversations[0].id;
            }
        }
        catch {
            // No bloquear el registro de la llamada si no se puede resolver el contacto
        }
        const call = this.callRepository.create({
            direction: 'inbound',
            from_number: params.from,
            to_number: params.to,
            twilio_call_sid: params.callSid,
            status: 'ringing',
            contact_id: contactId,
            conversation_id: conversationId,
        });
        await this.callRepository.save(call);
    }
    async logOutgoingCall(params) {
        const call = this.callRepository.create({
            direction: 'outbound',
            from_number: params.from,
            to_number: params.to,
            twilio_call_sid: params.callSid || null,
            status: 'initiated',
        });
        await this.callRepository.save(call);
    }
    async updateStatusByCallSid(callSid, status, durationSeconds) {
        await this.callRepository.raw.update({ twilio_call_sid: callSid }, {
            status,
            ...(durationSeconds !== undefined ? { duration_seconds: durationSeconds } : {}),
        });
    }
    async findAll(conversationId) {
        if (conversationId) {
            return this.callRepository.find({ where: { conversation_id: conversationId }, order: { created_at: 'DESC' } });
        }
        return this.callRepository.find({ order: { created_at: 'DESC' } });
    }
};
exports.VoiceService = VoiceService;
exports.VoiceService = VoiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(voice_tokens_1.CALL_REPO)),
    __metadata("design:paramtypes", [tenant_scoped_repository_1.TenantScopedRepository,
        voice_integrations_service_1.VoiceIntegrationsService,
        contacts_service_1.ContactsService,
        conversations_service_1.ConversationsService])
], VoiceService);
//# sourceMappingURL=voice.service.js.map