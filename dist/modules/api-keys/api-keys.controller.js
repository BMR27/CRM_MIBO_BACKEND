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
exports.ApiKeysController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_keys_service_1 = require("./api-keys.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let ApiKeysController = class ApiKeysController {
    constructor(apiKeysService) {
        this.apiKeysService = apiKeysService;
    }
    assertAdmin(req) {
        // Ver nota en AuthController.signup: no se usa @Roles('admin') porque el RolesGuard
        // global corre antes que los guards de método, así que req.user no existiría todavía.
        if (req.user.role !== 'admin') {
            throw new common_1.ForbiddenException('Solo un administrador puede gestionar API keys');
        }
    }
    async create(req, body) {
        this.assertAdmin(req);
        const { apiKey, rawKey } = await this.apiKeysService.create(body.name);
        return {
            id: apiKey.id,
            name: apiKey.name,
            key: rawKey,
            key_prefix: apiKey.key_prefix,
            created_at: apiKey.created_at,
            warning: 'Guarda esta key ahora: no volverá a mostrarse completa.',
        };
    }
    async findAll(req) {
        this.assertAdmin(req);
        const keys = await this.apiKeysService.findAllForTenant();
        return keys.map((k) => ({
            id: k.id,
            name: k.name,
            key_prefix: k.key_prefix,
            is_active: k.is_active,
            last_used_at: k.last_used_at,
            created_at: k.created_at,
        }));
    }
    async revoke(req, id) {
        this.assertAdmin(req);
        await this.apiKeysService.revoke(id);
        return { success: true };
    }
};
exports.ApiKeysController = ApiKeysController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(201),
    (0, swagger_1.ApiOperation)({
        summary: 'Generar API key',
        description: 'Genera una API key nueva para el tenant. El valor completo solo se devuelve una vez.',
    }),
    (0, swagger_1.ApiBody)({ schema: { type: 'object', properties: { name: { type: 'string', example: 'Sitio web principal' } }, required: ['name'] } }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar API keys del tenant' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/revoke'),
    (0, swagger_1.ApiOperation)({ summary: 'Revocar API key' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la API key' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ApiKeysController.prototype, "revoke", null);
exports.ApiKeysController = ApiKeysController = __decorate([
    (0, swagger_1.ApiTags)('API Keys - Integraciones'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('api-keys'),
    __metadata("design:paramtypes", [api_keys_service_1.ApiKeysService])
], ApiKeysController);
//# sourceMappingURL=api-keys.controller.js.map