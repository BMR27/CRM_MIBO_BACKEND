"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("../users/users.service");
const user_entity_1 = require("../users/entities/user.entity");
const roles_service_1 = require("../roles/roles.service");
const tenants_service_1 = require("../tenants/tenants.service");
const role_entity_1 = require("../roles/entities/role.entity");
const auth_service_1 = require("./auth.service");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const platform_admin_guard_1 = require("../../common/auth/platform-admin.guard");
const bcrypt = __importStar(require("bcryptjs"));
let AuthController = class AuthController {
    constructor(usersService, rolesService, tenantsService, authService, dataSource) {
        this.usersService = usersService;
        this.rolesService = rolesService;
        this.tenantsService = tenantsService;
        this.authService = authService;
        this.dataSource = dataSource;
    }
    async signupCompany(body) {
        if (!body.companyName || !body.adminEmail || !body.adminPassword) {
            throw new common_1.BadRequestException('companyName, adminEmail y adminPassword son requeridos');
        }
        if (body.legalType && !['fisica', 'moral'].includes(body.legalType)) {
            throw new common_1.BadRequestException('legalType debe ser "fisica" o "moral"');
        }
        try {
            return await this.dataSource.transaction(async (manager) => {
                const tenant = await this.tenantsService.createTenant({
                    name: body.companyName,
                    legal_type: body.legalType || 'fisica',
                    tax_id: body.taxId,
                    legal_name: body.legalType === 'moral' ? body.companyName : undefined,
                }, manager);
                await this.rolesService.seedDefaultRolesForTenant(tenant.id, manager);
                const adminRole = await manager.findOne(role_entity_1.Role, {
                    where: { tenant_id: tenant.id, name: 'Administrador' },
                });
                const hashedPassword = await bcrypt.hash(body.adminPassword, 10);
                const user = manager.create(user_entity_1.User, {
                    tenant_id: tenant.id,
                    email: body.adminEmail,
                    password_hash: hashedPassword,
                    name: body.adminName || body.adminEmail.split('@')[0],
                    role_id: adminRole?.id || null,
                    status: 'offline',
                });
                const savedUser = await manager.save(user_entity_1.User, user);
                const token = this.authService.signToken({ id: savedUser.id, email: savedUser.email, role: adminRole }, tenant.id);
                return {
                    message: 'Compañía registrada exitosamente',
                    access_token: token,
                    token_type: 'Bearer',
                    expires_in: '7d',
                    tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
                    user: {
                        id: savedUser.id,
                        email: savedUser.email,
                        name: savedUser.name,
                        role: adminRole?.name || null,
                        tenant_id: tenant.id,
                    },
                };
            });
        }
        catch (error) {
            if (error?.code === '23505') {
                throw new common_1.BadRequestException('El email ya está registrado');
            }
            throw new common_1.BadRequestException(error.message || 'Error al registrar la compañía');
        }
    }
    async signup(req, body) {
        // Nota: no se usa @Roles('admin') aquí porque el RolesGuard global (APP_GUARD) se ejecuta
        // antes que los guards declarados a nivel de método como JwtAuthGuard, por lo que
        // request.user todavía no existiría cuando RolesGuard lo revisa. Se valida el rol a mano.
        if (req.user.role !== 'admin') {
            throw new common_1.ForbiddenException('Solo un administrador puede registrar nuevos agentes');
        }
        try {
            const tenantId = req.user.tenantId;
            const agentRole = await this.rolesService.findByNameForTenant(tenantId, 'Agente');
            const user = await this.usersService.create({
                email: body.email,
                password: body.password,
                full_name: body.name || body.email.split('@')[0],
                role_id: agentRole?.id || null,
                tenant_id: tenantId,
            });
            const userWithRole = await this.usersService.findById(user.id);
            const token = this.authService.signToken({ id: userWithRole.id, email: userWithRole.email, role: userWithRole.role }, tenantId);
            return {
                message: 'Usuario registrado exitosamente',
                access_token: token,
                token_type: 'Bearer',
                expires_in: '7d',
                user: {
                    id: userWithRole.id,
                    email: userWithRole.email,
                    name: userWithRole.name,
                    role: userWithRole.role?.name || null,
                    tenant_id: tenantId,
                },
            };
        }
        catch (error) {
            if (error?.code === '23505') {
                throw new common_1.BadRequestException('El email ya está registrado');
            }
            throw new common_1.BadRequestException(error.message || 'Error al registrar usuario');
        }
    }
    async login(body) {
        try {
            const user = await this.usersService.findByEmailWithRole(body.email);
            if (!user) {
                throw new common_1.BadRequestException('Email o contraseña inválidos');
            }
            const isValidPassword = await this.usersService.validatePassword(user, body.password);
            if (!isValidPassword) {
                throw new common_1.BadRequestException('Email o contraseña inválidos');
            }
            const token = this.authService.signToken({ id: user.id, email: user.email, role: user.role }, user.tenant_id, user.is_platform_admin === true);
            return {
                access_token: token,
                token_type: 'Bearer',
                expires_in: '7d',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role?.name || null,
                    role_id: user.role_id,
                    tenant_id: user.tenant_id,
                    is_platform_admin: user.is_platform_admin === true,
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || 'Error al iniciar sesión');
        }
    }
    async impersonate(req, tenantId) {
        const tenant = await this.tenantsService.findById(tenantId);
        if (!tenant) {
            throw new common_1.NotFoundException('El espacio indicado no existe');
        }
        const token = this.authService.signToken({ id: req.user.id, email: req.user.email, role: { name: 'admin' } }, tenant.id, true);
        return {
            access_token: token,
            token_type: 'Bearer',
            expires_in: '7d',
            tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
        };
    }
    async getMe(req) {
        const user = await this.usersService.findByEmailWithRole(req.user.email);
        if (!user) {
            throw new common_1.BadRequestException('Usuario no encontrado');
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role?.name || null,
            role_id: user.role_id,
            tenant_id: user.tenant_id,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('signup-company'),
    (0, common_1.HttpCode)(201),
    (0, swagger_1.ApiOperation)({
        summary: 'Registrar compañía',
        description: 'Crea un nuevo tenant (espacio de trabajo) junto con su usuario administrador. Retorna un token JWT.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                legalType: { type: 'string', enum: ['fisica', 'moral'], example: 'moral' },
                companyName: { type: 'string', example: 'Acme Inc.' },
                taxId: { type: 'string', example: 'ACM010101AAA' },
                adminName: { type: 'string', example: 'Jane Doe' },
                adminEmail: { type: 'string', example: 'jane@acme.com' },
                adminPassword: { type: 'string', example: 'password123' },
            },
            required: ['legalType', 'companyName', 'adminName', 'adminEmail', 'adminPassword'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Compañía y usuario administrador creados. Retorna JWT.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Datos inválidos o email ya registrado' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signupCompany", null);
__decorate([
    (0, common_1.Post)('signup'),
    (0, common_1.HttpCode)(201),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Registrar agente',
        description: 'Crea un nuevo usuario/agente dentro del tenant del administrador autenticado. Requiere JWT de un admin.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'agent@example.com' },
                password: { type: 'string', example: 'password123' },
                name: { type: 'string', example: 'John Doe' },
            },
            required: ['email', 'password'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Registro exitoso. Retorna usuario y JWT token.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'El email ya está registrado' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Iniciar sesión',
        description: 'Autentica un usuario y retorna un token JWT válido por 7 días. ' +
            'Usa este token en el header Authorization: Bearer {token} para los demás endpoints.',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'agent@example.com' },
                password: { type: 'string', example: 'password123' },
            },
            required: ['email', 'password'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login exitoso. Retorna JWT token con información del usuario.',
        schema: {
            type: 'object',
            properties: {
                access_token: { type: 'string' },
                token_type: { type: 'string', example: 'Bearer' },
                expires_in: { type: 'string', example: '7d' },
                user: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        name: { type: 'string' },
                        role: { type: 'string', example: 'admin' },
                    },
                },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Credenciales inválidas',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('impersonate/:tenantId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, platform_admin_guard_1.PlatformAdminGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Emitir un token para ver el detalle de otro espacio (solo super-admin de plataforma)',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "impersonate", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtener información del usuario actual',
        description: 'Retorna la información del usuario autenticado basado en el JWT token.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Información del usuario',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' },
                role_id: { type: 'string' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'No autorizado - Token inválido o expirado',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth - Autenticación'),
    (0, common_1.Controller)('auth'),
    __param(0, (0, common_1.Inject)(users_service_1.UsersService)),
    __param(1, (0, common_1.Inject)(roles_service_1.RolesService)),
    __param(2, (0, common_1.Inject)(tenants_service_1.TenantsService)),
    __param(4, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        roles_service_1.RolesService,
        tenants_service_1.TenantsService,
        auth_service_1.AuthService,
        typeorm_2.DataSource])
], AuthController);
//# sourceMappingURL=auth.controller.js.map