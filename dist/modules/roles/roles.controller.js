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
exports.RolesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_service_1 = require("./roles.service");
let RolesController = class RolesController {
    constructor(rolesService) {
        this.rolesService = rolesService;
    }
    async getRoles() {
        return this.rolesService.findAll();
    }
    async getRoleById(id) {
        return this.rolesService.findById(id);
    }
    async createRole(body) {
        return this.rolesService.create(body);
    }
    async updateRole(id, body) {
        return this.rolesService.update(id, body);
    }
    async deleteRole(id) {
        await this.rolesService.delete(id);
        return { success: true, message: 'Rol desactivado' };
    }
    async seedRoles() {
        await this.rolesService.seedDefaultRoles();
        return { success: true, message: 'Roles por defecto creados' };
    }
};
exports.RolesController = RolesController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Listar roles',
        description: 'Obtiene todos los roles activos con sus permisos configurados.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de roles',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'uuid' },
                    name: { type: 'string', example: 'Administrador' },
                    description: { type: 'string', example: 'Acceso completo al sistema' },
                    permissions: {
                        type: 'object',
                        example: {
                            conversations: { read: true, write: true, delete: true },
                            contacts: { read: true, write: true, delete: true },
                            users: { read: true, write: true, delete: true },
                        },
                    },
                    is_active: { type: 'boolean', example: true },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del rol' }),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener rol por ID',
        description: 'Obtiene los detalles completos de un rol específico.',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "getRoleById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(201),
    (0, swagger_1.ApiOperation)({
        summary: 'Crear rol',
        description: 'Crea un nuevo rol con permisos personalizados. Los permisos se configuran por módulo.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Soporte' },
                description: { type: 'string', example: 'Rol para equipo de soporte' },
                permissions: {
                    type: 'object',
                    example: {
                        conversations: { read: true, write: true, delete: false },
                        contacts: { read: true, write: true, delete: false },
                        users: { read: false, write: false, delete: false },
                    },
                },
            },
            required: ['name', 'permissions'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "createRole", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del rol' }),
    (0, swagger_1.ApiOperation)({
        summary: 'Actualizar rol',
        description: 'Actualiza los permisos o información de un rol existente.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                description: { type: 'string' },
                permissions: { type: 'object' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del rol' }),
    (0, swagger_1.ApiOperation)({
        summary: 'Eliminar rol',
        description: 'Desactiva un rol (soft delete). Los usuarios con este rol mantendrán su asignación.',
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "deleteRole", null);
__decorate([
    (0, common_1.Post)('seed'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Crear roles por defecto',
        description: 'Crea los roles iniciales: Administrador, Agente, Supervisor y Usuario. Solo si no existen roles.',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RolesController.prototype, "seedRoles", null);
exports.RolesController = RolesController = __decorate([
    (0, swagger_1.ApiTags)('Roles - Gestión de Roles y Permisos'),
    (0, common_1.Controller)('roles'),
    __metadata("design:paramtypes", [roles_service_1.RolesService])
], RolesController);
//# sourceMappingURL=roles.controller.js.map