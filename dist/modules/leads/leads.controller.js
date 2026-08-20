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
exports.LeadsController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const swagger_1 = require("@nestjs/swagger");
const leads_service_1 = require("./leads.service");
const create_lead_dto_1 = require("./dto/create-lead.dto");
const update_lead_dto_1 = require("./dto/update-lead.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const api_key_guard_1 = require("../api-keys/guards/api-key.guard");
let LeadsController = class LeadsController {
    constructor(leadsService) {
        this.leadsService = leadsService;
    }
    async createPublicLead(dto, req) {
        const lead = await this.leadsService.createFromPublic(dto, `api-key:${req.user.apiKeyId}`);
        return { success: true, lead: { id: lead.id, status: lead.status, created_at: lead.created_at } };
    }
    async findAll() {
        return this.leadsService.findAll();
    }
    async update(id, dto) {
        return this.leadsService.update(id, dto);
    }
    async convert(id) {
        return this.leadsService.convertToContact(id);
    }
};
exports.LeadsController = LeadsController;
__decorate([
    (0, common_1.Post)('public/leads'),
    (0, common_1.UseGuards)(api_key_guard_1.ApiKeyGuard, throttler_1.ThrottlerGuard),
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: 60000 } }),
    (0, swagger_1.ApiHeader)({ name: 'X-API-Key', description: 'API key del tenant' }),
    (0, swagger_1.ApiOperation)({
        summary: 'Capturar lead (público, vía API key)',
        description: 'Endpoint para integrar formularios/sistemas externos. Autenticado con X-API-Key, no con JWT.',
    }),
    (0, swagger_1.ApiBody)({ type: create_lead_dto_1.CreatePublicLeadDto }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_lead_dto_1.CreatePublicLeadDto, Object]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "createPublicLead", null);
__decorate([
    (0, common_1.Get)('leads'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar leads del tenant' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)('leads/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar estado de un lead' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del lead' }),
    (0, swagger_1.ApiBody)({ type: update_lead_dto_1.UpdateLeadDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_lead_dto_1.UpdateLeadDto]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('leads/:id/convert'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Convertir un lead en contacto del CRM',
        description: 'Crea (o reutiliza) un Contact a partir del phone_number del lead y lo vincula via contact_id. ' +
            'Esto NO crea una orden: las órdenes son un recurso aparte que se crea explícitamente con ' +
            'POST /api/orders usando el contact_id devuelto aquí.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del lead' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Lead convertido (o ya estaba convertido)',
        schema: {
            type: 'object',
            properties: {
                lead: { type: 'object', description: 'Lead actualizado, status="converted", incluye contact_id' },
                contact: { type: 'object', description: 'Contact creado o reutilizado' },
                alreadyConverted: { type: 'boolean', description: 'true si el lead ya tenía contact_id previamente' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeadsController.prototype, "convert", null);
exports.LeadsController = LeadsController = __decorate([
    (0, swagger_1.ApiTags)('Leads'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [leads_service_1.LeadsService])
], LeadsController);
//# sourceMappingURL=leads.controller.js.map