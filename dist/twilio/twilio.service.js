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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwilioService = void 0;
const common_1 = require("@nestjs/common");
const twilio_1 = require("twilio");
const axios_1 = __importDefault(require("axios"));
const tenant_context_1 = require("../common/tenant/tenant-context");
const whatsapp_integrations_service_1 = require("../modules/whatsapp/whatsapp-integrations.service");
let TwilioService = class TwilioService {
    constructor(whatsappIntegrationsService) {
        this.whatsappIntegrationsService = whatsappIntegrationsService;
        this.allowedWATemplates = [
            { name: 'customer_service_intro_v1', sid: 'HXf9420e6e4ff17a94fe3dfaceb7aa657b' },
            { name: 'pedido_enviado_v1', sid: 'HX36751a5be358338dd5082fa394b515f5' },
        ];
    }
    async getCredentials() {
        const tenantId = tenant_context_1.TenantContext.getTenantId();
        const config = await this.whatsappIntegrationsService.getConfigForTenant(tenantId);
        if (!config?.twilioAccountSid || !config?.twilioAuthToken) {
            throw new common_1.BadRequestException('Twilio no está configurado para este espacio de trabajo');
        }
        return {
            accountSid: config.twilioAccountSid,
            authToken: config.twilioAuthToken,
            whatsappFrom: config.twilioWhatsappNumber,
        };
    }
    async getClient() {
        const { accountSid, authToken } = await this.getCredentials();
        return new twilio_1.Twilio(accountSid, authToken);
    }
    /**
     * Lista plantillas aprobadas de WhatsApp en Twilio usando Content API vía HTTP
     */
    async listApprovedWATemplates(serviceSid) {
        const { accountSid, authToken } = await this.getCredentials();
        let url = `https://content.twilio.com/v1/WhatsApp/Templates?Status=approved`;
        if (serviceSid) {
            url = `https://content.twilio.com/v1/Services/${serviceSid}/Templates?Status=approved`;
        }
        try {
            const response = await axios_1.default.get(url, {
                auth: { username: accountSid, password: authToken },
            });
            const templates = response.data.templates || [];
            return templates.filter((template) => {
                const name = String(template?.friendly_name || template?.name || '').trim();
                const sid = String(template?.sid || '').trim();
                return this.allowedWATemplates.some((allowed) => name === allowed.name || sid === allowed.sid);
            });
        }
        catch (err) {
            console.error('Twilio API error:', err?.response?.data || err?.message || err);
            throw err;
        }
    }
    async sendWhatsAppTemplate({ to, from, contentSid, variables = [], }) {
        const client = await this.getClient();
        let contentVariables = {};
        if (Array.isArray(variables)) {
            variables.forEach((val, idx) => {
                contentVariables[(idx + 1).toString()] = val;
            });
        }
        const payload = {
            to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
            from: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
            contentSid: contentSid,
            contentVariables: JSON.stringify(contentVariables),
        };
        return client.messages.create(payload);
    }
    /**
     * Envía mensaje WhatsApp usando ContentSid y ContentVariables exactamente como el cURL
     */
    async sendWhatsAppTemplateViaHttp({ to, from, contentSid, variables = [], }) {
        const { accountSid, authToken } = await this.getCredentials();
        const contentVariables = {};
        if (Array.isArray(variables)) {
            variables.forEach((val, idx) => {
                contentVariables[(idx + 1).toString()] = val;
            });
        }
        const data = new URLSearchParams();
        data.append('To', to.startsWith('whatsapp:') ? to : `whatsapp:${to}`);
        data.append('From', from.startsWith('whatsapp:') ? from : `whatsapp:${from}`);
        data.append('ContentSid', contentSid);
        data.append('ContentVariables', JSON.stringify(contentVariables));
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const response = await axios_1.default.post(url, data, {
            auth: { username: accountSid, password: authToken },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return response.data;
    }
    async sendWhatsAppMedia({ to, from, mediaUrl, body, }) {
        const client = await this.getClient();
        const payload = {
            to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
            from: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
            mediaUrl: [mediaUrl],
            ...(body && body.trim() ? { body: body.trim() } : {}),
        };
        return client.messages.create(payload);
    }
    async downloadFirstMediaByMessageSid(messageSid) {
        const { accountSid, authToken } = await this.getCredentials();
        const client = new twilio_1.Twilio(accountSid, authToken);
        const mediaList = await client.messages(messageSid).media.list({ limit: 1 });
        if (!mediaList || mediaList.length === 0) {
            throw new Error('No media found for this message');
        }
        const media = mediaList[0];
        const mediaUri = String(media?.uri || '');
        if (!mediaUri) {
            throw new Error('Media URI not found');
        }
        // Twilio media URI ends with .json; removing it returns the raw media bytes.
        const rawMediaUrl = `https://api.twilio.com${mediaUri.replace(/\.json$/i, '')}`;
        const resp = await axios_1.default.get(rawMediaUrl, {
            auth: { username: accountSid, password: authToken },
            responseType: 'arraybuffer',
        });
        const contentType = String(resp.headers['content-type'] || media?.contentType || 'application/octet-stream');
        const contentDisposition = String(resp.headers['content-disposition'] || '');
        return {
            data: Buffer.from(resp.data),
            contentType,
            contentDisposition,
        };
    }
    async getDefaultWhatsappFrom() {
        const { whatsappFrom } = await this.getCredentials();
        return whatsappFrom ? `whatsapp:${whatsappFrom}` : undefined;
    }
};
exports.TwilioService = TwilioService;
exports.TwilioService = TwilioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [whatsapp_integrations_service_1.WhatsappIntegrationsService])
], TwilioService);
//# sourceMappingURL=twilio.service.js.map