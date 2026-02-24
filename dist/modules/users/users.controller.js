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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_decorator_1 = require("../../decorators/roles.decorator");
const users_service_1 = require("./users.service");
class CreateUserDto {
}
class UpdateUserDto {
}
class UpdatePasswordDto {
}
let UsersController = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
    }
    async getUsers() {
        return this.usersService.findAll();
    }
    async getAgents() {
        return this.usersService.findAgents();
    }
    async getUserById(id) {
        return this.usersService.findById(id);
    }
    async createUser(body) {
        return this.usersService.create(body);
    }
    async updateUser(id, body) {
        return this.usersService.update(id, body);
    }
    async updatePassword(id, body) {
        await this.usersService.updatePassword(id, body.newPassword);
        return { message: 'Contraseña actualizada exitosamente' };
    }
    async deleteUser(id) {
        await this.usersService.delete(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Listar usuarios',
        description: 'Obtiene la lista completa de usuarios con sus roles y permisos.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de usuarios obtenida',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'string', example: 'uuid' },
                    email: { type: 'string', example: 'agent@example.com' },
                    full_name: { type: 'string', example: 'Juan Pérez' },
                    status: {
                        type: 'string',
                        enum: ['available', 'busy', 'offline'],
                        example: 'available',
                    },
                    role_id: { type: 'string', example: 'uuid-del-rol' },
                    role: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', example: 'uuid' },
                            name: { type: 'string', example: 'Agente' },
                            description: { type: 'string', example: 'Rol para agentes' },
                            permissions: {
                                type: 'object',
                                example: {
                                    conversations: { read: true, write: true, delete: false },
                                    contacts: { read: true, write: true, delete: false },
                                },
                            },
                        },
                    },
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)('agents'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Listar agentes',
        description: 'Obtiene la lista de agentes (requiere autenticación)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Lista de agentes obtenida',
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAgents", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener usuario por ID',
        description: 'Obtiene un usuario específico con su rol y permisos.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'ID del usuario',
        example: 'uuid',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Usuario encontrado',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: 'uuid' },
                email: { type: 'string', example: 'agent@example.com' },
                full_name: { type: 'string', example: 'Juan Pérez' },
                status: { type: 'string', example: 'available' },
                role_id: { type: 'string', example: 'uuid-del-rol' },
                role: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string', example: 'Agente' },
                        description: { type: 'string' },
                        permissions: {
                            type: 'object',
                            example: {
                                conversations: { read: true, write: true, delete: false },
                            },
                        },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(201),
    (0, swagger_1.ApiOperation)({
        summary: 'Crear usuario',
        description: 'Registra un nuevo usuario/agente en el sistema (solo admin).',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'newagent@example.com' },
                password: { type: 'string', example: 'SecurePass123!' },
                full_name: { type: 'string', example: 'Nuevo Agente' },
                role_id: { type: 'string', example: 'uuid-del-rol' },
            },
            required: ['email', 'password', 'full_name', 'role_id'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Usuario creado exitosamente',
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'El email ya está registrado',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Acceso denegado - solo admin',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createUser", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, roles_decorator_1.Roles)('admin', 'supervisor'),
    (0, swagger_1.ApiOperation)({
        summary: 'Actualizar usuario',
        description: 'Actualiza los datos de un usuario existente.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del usuario' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'newemail@example.com' },
                full_name: { type: 'string', example: 'Nombre Actualizado' },
                role_id: { type: 'string', example: 'uuid-nuevo-rol' },
                status: {
                    type: 'string',
                    enum: ['available', 'busy', 'offline'],
                    example: 'available',
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Usuario actualizado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acceso denegado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.Put)(':id/password'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Cambiar contraseña',
        description: 'Actualiza la contraseña de un usuario.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del usuario' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                newPassword: { type: 'string', example: 'NewSecurePass123!' },
            },
            required: ['newPassword'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Contraseña actualizada' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdatePasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updatePassword", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(204),
    (0, swagger_1.ApiOperation)({
        summary: 'Eliminar usuario',
        description: 'Elimina un usuario del sistema (solo admin).',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del usuario' }),
    (0, swagger_1.ApiResponse)({ status: 204, description: 'Usuario eliminado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Usuario no encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Acceso denegado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users - Gestión de Usuarios'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map