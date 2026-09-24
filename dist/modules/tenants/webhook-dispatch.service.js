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
var WebhookDispatchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookDispatchService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const axios_1 = __importDefault(require("axios"));
const tenants_service_1 = require("./tenants.service");
/**
 * Envía eventos salientes al webhook_url configurado por cada tenant, firmados con
 * HMAC-SHA256 usando su webhook_secret. No lanza si el envío falla (los eventos de
 * mensajería no deben tumbar el flujo que los origina); registra el error y regresa
 * el resultado para que el llamador decida si loguearlo.
 */
let WebhookDispatchService = WebhookDispatchService_1 = class WebhookDispatchService {
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
        this.logger = new common_1.Logger(WebhookDispatchService_1.name);
    }
    async dispatch(tenantId, event, data) {
        const tenant = await this.tenantsService.findById(tenantId);
        if (!tenant?.webhook_events_enabled || !tenant.webhook_url) {
            return { skipped: true };
        }
        const secret = await this.tenantsService.getWebhookSecretPlain(tenantId);
        const payload = {
            event,
            timestamp: new Date().toISOString(),
            tenant_id: tenantId,
            data,
        };
        const body = JSON.stringify(payload);
        const headers = {
            'Content-Type': 'application/json',
            'X-Mibo-Event': event,
        };
        if (secret) {
            headers['X-Mibo-Signature'] = `sha256=${(0, crypto_1.createHmac)('sha256', secret).update(body).digest('hex')}`;
        }
        const attempt = () => axios_1.default.post(tenant.webhook_url, body, { headers, timeout: 5000 });
        try {
            await attempt();
            return { skipped: false, success: true };
        }
        catch (firstError) {
            this.logger.warn(`Primer intento de webhook falló (tenant ${tenantId}, evento ${event}): ${firstError?.message}`);
            try {
                await attempt();
                return { skipped: false, success: true, retried: true };
            }
            catch (secondError) {
                this.logger.error(`Webhook saliente falló tras reintento (tenant ${tenantId}, evento ${event}, url ${tenant.webhook_url}): ${secondError?.message}`);
                return { skipped: false, success: false, retried: true, error: secondError?.message };
            }
        }
    }
};
exports.WebhookDispatchService = WebhookDispatchService;
exports.WebhookDispatchService = WebhookDispatchService = WebhookDispatchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], WebhookDispatchService);
//# sourceMappingURL=webhook-dispatch.service.js.map