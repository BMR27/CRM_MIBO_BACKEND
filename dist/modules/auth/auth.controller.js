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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("../users/users.service");
const roles_service_1 = require("../roles/roles.service");
const passport_1 = require("@nestjs/passport");
let AuthController = class AuthController {
    constructor(jwtService, usersService, rolesService) {
        this.jwtService = jwtService;
        this.usersService = usersService;
        this.rolesService = rolesService;
    }
    async signup(body) {
        try {
            // Verificar si el usuario ya existe
            const existingUser = await this.usersService.findByEmail(body.email);
            if (existingUser) {
                throw new common_1.BadRequestException('El email ya está registrado');
            }
            // Rol por defecto: Agente
            const agentRole = await this.rolesService.findByName('Agente');
            const user = await this.usersService.create({
                email: body.email,
                password: body.password,
                full_name: body.name || body.email.split('@')[0],
                role_id: agentRole?.id || null,
            });
            // Cargar usuario con rol
            const userWithRole = await this.usersService.findByEmailWithRole(user.email);
            // Normalizar rol para JWT ('admin' | 'supervisor' | 'agent')
            const normalizeRole = (name) => {
                const n = (name || '').toLowerCase();
                if (n.startsWith('admin'))
                    return 'admin';
                if (n.startsWith('super'))
                    return 'supervisor';
                if (n.startsWith('agente') || n.startsWith('agent'))
                    return 'agent';
                return 'agent';
            };
            // Generar token JWT con rol
            const token = this.jwtService.sign({
                email: userWithRole.email,
                sub: userWithRole.id,
                role: normalizeRole(userWithRole.role?.name),
            }, { expiresIn: '7d' });
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
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || 'Error al registrar usuario');
        }
    }
    async login(body) {
        try {
            // Buscar usuario por email con rol
            const user = await this.usersService.findByEmailWithRole(body.email);
            if (!user) {
                throw new common_1.BadRequestException('Email o contraseña inválidos');
            }
            // Validar contraseña
            const isValidPassword = await this.usersService.validatePassword(user, body.password);
            if (!isValidPassword) {
                throw new common_1.BadRequestException('Email o contraseña inválidos');
            }
            // Generar token JWT con información del rol
            const normalizeRole = (name) => {
                const n = (name || '').toLowerCase();
                if (n.startsWith('admin'))
                    return 'admin';
                if (n.startsWith('super'))
                    return 'supervisor';
                if (n.startsWith('agente') || n.startsWith('agent'))
                    return 'agent';
                return 'agent';
            };
            const token = this.jwtService.sign({
                email: user.email,
                sub: user.id,
                role: normalizeRole(user.role?.name),
            }, { expiresIn: '7d' });
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
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(error.message || 'Error al iniciar sesión');
        }
    }
    async getMe(req) {
        // El usuario viene del JWT strategy
        const userId = req.user.sub;
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
        };
    }
    generateTestToken() {
        const token = this.jwtService.sign({ email: 'test@example.com', sub: 'test-user', role: 'admin' }, { expiresIn: '7d' });
        return {
            access_token: token,
            message: 'Usa este token en el header Authorization: Bearer ' + token,
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('signup'),
    (0, common_1.HttpCode)(201),
    (0, swagger_1.ApiOperation)({
        summary: 'Registrarse',
        description: 'Crea una nueva cuenta de usuario y retorna un token JWT.',
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
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Registro exitoso. Retorna usuario y JWT token.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'El email ya está registrado',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
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
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
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
__decorate([
    (0, common_1.Post)('test-token'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Generar token de prueba',
        description: 'Genera un token JWT de prueba válido sin validar credenciales. Útil solo para testing.',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token generado',
        schema: {
            type: 'object',
            properties: {
                access_token: { type: 'string' },
                message: {
                    type: 'string',
                    example: 'Usa este token en Authorization header: Bearer {token}',
                },
            },
        },
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "generateTestToken", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth - Autenticación'),
    (0, common_1.Controller)('auth'),
    __param(1, (0, common_1.Inject)(users_service_1.UsersService)),
    __param(2, (0, common_1.Inject)(roles_service_1.RolesService)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        users_service_1.UsersService,
        roles_service_1.RolesService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map