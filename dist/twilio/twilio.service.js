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
let TwilioService = class TwilioService {
    constructor() {
        this.client = new twilio_1.Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
    /**
     * Lista plantillas aprobadas de WhatsApp en Twilio usando Content API vía HTTP
     */
    async listApprovedWATemplates() {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const url = `https://content.twilio.com/v1/WhatsApp/Templates?Status=approved`;
        const response = await axios_1.default.get(url, {
            auth: { username: accountSid, password: authToken }
        });
        return response.data.templates || [];
    }
    async sendWhatsAppTemplate({ to, from, contentSid, variables = [], }) {
        // Mapear variables a formato {"1": "valor1", "2": "valor2", ...}
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
            contentVariables: JSON.stringify(contentVariables), // Debe ser string para el SDK
        };
        // Log para depuración
        // eslint-disable-next-line no-console
        console.log('Twilio sendWhatsAppTemplate payload:', payload);
        return this.client.messages.create(payload);
    }
    /**
     * Envía mensaje WhatsApp usando ContentSid y ContentVariables exactamente como el cURL
     */
    async sendWhatsAppTemplateViaHttp({ to, from, contentSid, variables = [], }) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        // Construir ContentVariables: {"1":"valor1", ...}
        const contentVariables = {};
        if (Array.isArray(variables)) {
            variables.forEach((val, idx) => {
                contentVariables[(idx + 1).toString()] = val;
            });
        }
        const data = new URLSearchParams();
        data.append('To', to.startsWith('whatsapp:') ? to : `whatsapp:${to}`);
        data.append('From', from.startsWith('whatsapp:') ? from : `whatsapp:${from}`);
        data.append('ContentSid', contentSid); // Respetar mayúsculas
        data.append('ContentVariables', JSON.stringify(contentVariables));
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const response = await axios_1.default.post(url, data, {
            auth: { username: accountSid, password: authToken },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        return response.data;
    }
};
exports.TwilioService = TwilioService;
exports.TwilioService = TwilioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], TwilioService);
//# sourceMappingURL=twilio.service.js.map