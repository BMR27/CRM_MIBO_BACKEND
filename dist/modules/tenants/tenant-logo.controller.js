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
exports.TenantLogoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenants_service_1 = require("./tenants.service");
/**
 * Sirve el logo del tenant como imagen pública (sin JWT): lo consume un <img src>
 * directo en el navegador, que no manda Authorization. Separado de TenantsController
 * porque ese tiene JwtAuthGuard a nivel de clase.
 */
let TenantLogoController = class TenantLogoController {
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
    }
    async getBrandingLogo(id, res) {
        const logo = await this.tenantsService.getBrandingLogo(id);
        if (!logo) {
            throw new common_1.NotFoundException('Este espacio no tiene un logo subido');
        }
        res.setHeader('Content-Type', logo.mime);
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.send(logo.data);
    }
};
exports.TenantLogoController = TenantLogoController;
__decorate([
    (0, common_1.Get)(':id/branding-logo'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TenantLogoController.prototype, "getBrandingLogo", null);
exports.TenantLogoController = TenantLogoController = __decorate([
    (0, swagger_1.ApiExcludeController)(),
    (0, common_1.Controller)('tenants'),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantLogoController);
//# sourceMappingURL=tenant-logo.controller.js.map