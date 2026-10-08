"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalSecretGuard = void 0;
const common_1 = require("@nestjs/common");
/**
 * Protege endpoints internos (llamados servicio-a-servicio, p.ej. desde el frontend)
 * con un secreto compartido en el header `x-internal-secret`. Si INTERNAL_WEBHOOK_SECRET
 * no está configurada, deniega todo (fail closed) en vez de dejar el endpoint abierto.
 */
let InternalSecretGuard = class InternalSecretGuard {
    canActivate(context) {
        const expected = process.env.INTERNAL_WEBHOOK_SECRET;
        if (!expected) {
            throw new common_1.UnauthorizedException('INTERNAL_WEBHOOK_SECRET no está configurada');
        }
        const request = context.switchToHttp().getRequest();
        const provided = request.headers['x-internal-secret'];
        if (provided !== expected) {
            throw new common_1.UnauthorizedException('Secreto interno inválido');
        }
        return true;
    }
};
exports.InternalSecretGuard = InternalSecretGuard;
exports.InternalSecretGuard = InternalSecretGuard = __decorate([
    (0, common_1.Injectable)()
], InternalSecretGuard);
//# sourceMappingURL=internal-secret.guard.js.map