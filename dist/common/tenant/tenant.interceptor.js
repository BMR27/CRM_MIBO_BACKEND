"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const tenant_context_1 = require("./tenant-context");
/**
 * Resuelve el tenant de la request (JWT o API key, ambos dejan `req.user.tenantId`) y lo publica
 * en TenantContext para todo el service layer de esta request.
 *
 * Las rutas públicas/sin autenticar (webhooks de WhatsApp/Twilio, health checks) no tienen
 * `req.user`, así que caen al tenant `default`: esto preserva el comportamiento actual de esos
 * canales (single-tenant) hasta que exista enrutamiento real por canal/tenant (fuera de alcance
 * de esta fase — cada tenant tendría que tener su propio WABA/número, algo no contemplado hoy).
 */
let TenantInterceptor = class TenantInterceptor {
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const tenantId = req.user?.tenantId || tenant_context_1.DEFAULT_TENANT_ID;
        return new rxjs_1.Observable((subscriber) => {
            tenant_context_1.TenantContext.run({ tenantId, userId: req.user?.id, role: req.user?.role }, () => {
                next.handle().subscribe({
                    next: (value) => subscriber.next(value),
                    error: (err) => subscriber.error(err),
                    complete: () => subscriber.complete(),
                });
            });
        });
    }
};
exports.TenantInterceptor = TenantInterceptor;
exports.TenantInterceptor = TenantInterceptor = __decorate([
    (0, common_1.Injectable)()
], TenantInterceptor);
//# sourceMappingURL=tenant.interceptor.js.map