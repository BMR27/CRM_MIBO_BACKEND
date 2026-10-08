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
exports.InternalWebhooksController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const internal_secret_guard_1 = require("../../common/auth/internal-secret.guard");
const webhook_dispatch_service_1 = require("./webhook-dispatch.service");
/**
 * Endpoints internos (servicio-a-servicio) protegidos por InternalSecretGuard, no por JWT.
 * El frontend (que procesa los mensajes entrantes de WhatsApp vía Twilio) llama aquí para
 * reenviar eventos al webhook saliente del tenant, reusando la lógica de firma/reintento
 * de WebhookDispatchService en vez de duplicarla.
 */
let InternalWebhooksController = class InternalWebhooksController {
    constructor(webhookDispatchService) {
        this.webhookDispatchService = webhookDispatchService;
    }
    async dispatch(body) {
        const tenantId = String(body?.tenantId || '').trim();
        const event = String(body?.event || '').trim();
        if (!tenantId || !event) {
            throw new common_1.BadRequestException('tenantId y event son requeridos');
        }
        return this.webhookDispatchService.dispatch(tenantId, event, body?.data || {});
    }
};
exports.InternalWebhooksController = InternalWebhooksController;
__decorate([
    (0, common_1.Post)('dispatch'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InternalWebhooksController.prototype, "dispatch", null);
exports.InternalWebhooksController = InternalWebhooksController = __decorate([
    (0, swagger_1.ApiExcludeController)(),
    (0, common_1.Controller)('internal/webhooks'),
    (0, common_1.UseGuards)(internal_secret_guard_1.InternalSecretGuard),
    __metadata("design:paramtypes", [webhook_dispatch_service_1.WebhookDispatchService])
], InternalWebhooksController);
//# sourceMappingURL=internal-webhooks.controller.js.map