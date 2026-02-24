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
var RolesGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let RolesGuard = RolesGuard_1 = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
        this.logger = new common_1.Logger(RolesGuard_1.name);
    }
    canActivate(context) {
        // Get required roles from the decorator
        const requiredRoles = this.reflector.get('roles', context.getHandler());
        // If no roles are required, allow access
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            this.logger.warn('User not found in request');
            throw new common_1.ForbiddenException('User not found in request');
        }
        const userRole = user.role || user.roles;
        if (!userRole) {
            this.logger.warn(`User ${user.id} has no role`);
            throw new common_1.ForbiddenException('User does not have a role');
        }
        // Normalizar rol del usuario (aceptar español e inglés)
        const normalizeRole = (role) => {
            const normalized = role.toLowerCase();
            if (normalized.startsWith('admin'))
                return 'admin';
            if (normalized.startsWith('super'))
                return 'supervisor';
            if (normalized.startsWith('agente') || normalized.startsWith('agent'))
                return 'agent';
            return normalized;
        };
        const normalizedUserRole = normalizeRole(userRole);
        const normalizedRequiredRoles = requiredRoles.map(normalizeRole);
        // Check if user role is in the required roles
        const hasRole = normalizedRequiredRoles.includes(normalizedUserRole);
        if (!hasRole) {
            this.logger.warn(`User ${user.id} with role '${userRole}' (normalized: '${normalizedUserRole}') tried to access resource requiring roles: ${requiredRoles.join(', ')} (normalized: ${normalizedRequiredRoles.join(', ')})`);
            throw new common_1.ForbiddenException(`User role '${normalizedUserRole}' does not have access to this resource. Required roles: ${normalizedRequiredRoles.join(', ')}`);
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = RolesGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map