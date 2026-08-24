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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantFeatureGuard = exports.RequireTenantFeature = exports.TENANT_FEATURE_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const tenants_service_1 = require("../../modules/tenants/tenants.service");
exports.TENANT_FEATURE_KEY = 'tenantFeature';
const RequireTenantFeature = (flag) => (0, common_1.SetMetadata)(exports.TENANT_FEATURE_KEY, flag);
exports.RequireTenantFeature = RequireTenantFeature;
let TenantFeatureGuard = class TenantFeatureGuard {
    constructor(reflector, tenantsService) {
        this.reflector = reflector;
        this.tenantsService = tenantsService;
    }
    async canActivate(context) {
        const requiredFeature = this.reflector.get(exports.TENANT_FEATURE_KEY, context.getHandler());
        if (!requiredFeature) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const tenantId = request.user?.tenantId;
        if (!tenantId) {
            throw new common_1.ForbiddenException('No se pudo determinar el espacio de trabajo del usuario');
        }
        const tenant = await this.tenantsService.findById(tenantId);
        if (!tenant || !tenant[requiredFeature]) {
            throw new common_1.ForbiddenException('Esta función no está habilitada para tu espacio de trabajo');
        }
        return true;
    }
};
exports.TenantFeatureGuard = TenantFeatureGuard;
exports.TenantFeatureGuard = TenantFeatureGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        tenants_service_1.TenantsService])
], TenantFeatureGuard);
//# sourceMappingURL=tenant-feature.guard.js.map