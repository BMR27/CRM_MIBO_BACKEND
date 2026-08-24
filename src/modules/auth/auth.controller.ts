import { Controller, Post, Get, Body, Param, HttpCode, BadRequestException, ForbiddenException, NotFoundException, Inject, UseGuards, Request } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RolesService } from '../roles/roles.service';
import { TenantsService } from '../tenants/tenants.service';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Role } from '../roles/entities/role.entity';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PlatformAdminGuard } from '../../common/auth/platform-admin.guard';
import * as bcrypt from 'bcryptjs';

@ApiTags('Auth - Autenticación')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(UsersService) private usersService: UsersService,
    @Inject(RolesService) private rolesService: RolesService,
    @Inject(TenantsService) private tenantsService: TenantsService,
    private authService: AuthService,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Post('signup-company')
  @HttpCode(201)
  @ApiOperation({
    summary: 'Registrar compañía',
    description:
      'Crea un nuevo tenant (espacio de trabajo) junto con su usuario administrador. Retorna un token JWT.',
  })
  @ApiBody({
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
  })
  @ApiResponse({ status: 201, description: 'Compañía y usuario administrador creados. Retorna JWT.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o email ya registrado' })
  async signupCompany(
    @Body()
    body: {
      legalType?: 'fisica' | 'moral';
      companyName: string;
      taxId?: string;
      adminName: string;
      adminEmail: string;
      adminPassword: string;
    },
  ) {
    if (!body.companyName || !body.adminEmail || !body.adminPassword) {
      throw new BadRequestException('companyName, adminEmail y adminPassword son requeridos');
    }
    if (body.legalType && !['fisica', 'moral'].includes(body.legalType)) {
      throw new BadRequestException('legalType debe ser "fisica" o "moral"');
    }

    try {
      return await this.dataSource.transaction(async (manager) => {
        const tenant = await this.tenantsService.createTenant(
          {
            name: body.companyName,
            legal_type: body.legalType || 'fisica',
            tax_id: body.taxId,
            legal_name: body.legalType === 'moral' ? body.companyName : undefined,
          },
          manager,
        );

        await this.rolesService.seedDefaultRolesForTenant(tenant.id, manager);

        const adminRole = await manager.findOne(Role, {
          where: { tenant_id: tenant.id, name: 'Administrador' },
        });

        const hashedPassword = await bcrypt.hash(body.adminPassword, 10);
        const user = manager.create(User, {
          tenant_id: tenant.id,
          email: body.adminEmail,
          password_hash: hashedPassword,
          name: body.adminName || body.adminEmail.split('@')[0],
          role_id: adminRole?.id || null,
          status: 'offline',
        });
        const savedUser = await manager.save(User, user);

        const token = this.authService.signToken(
          { id: savedUser.id, email: savedUser.email, role: adminRole },
          tenant.id,
        );

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
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new BadRequestException('El email ya está registrado');
      }
      throw new BadRequestException(error.message || 'Error al registrar la compañía');
    }
  }

  @Post('signup')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Registrar agente',
    description:
      'Crea un nuevo usuario/agente dentro del tenant del administrador autenticado. Requiere JWT de un admin.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'agent@example.com' },
        password: { type: 'string', example: 'password123' },
        name: { type: 'string', example: 'John Doe' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({ status: 201, description: 'Registro exitoso. Retorna usuario y JWT token.' })
  @ApiResponse({ status: 400, description: 'El email ya está registrado' })
  async signup(@Request() req, @Body() body: { email: string; password: string; name?: string }) {
    // Nota: no se usa @Roles('admin') aquí porque el RolesGuard global (APP_GUARD) se ejecuta
    // antes que los guards declarados a nivel de método como JwtAuthGuard, por lo que
    // request.user todavía no existiría cuando RolesGuard lo revisa. Se valida el rol a mano.
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Solo un administrador puede registrar nuevos agentes');
    }

    try {
      const tenantId: string = req.user.tenantId;

      const agentRole = await this.rolesService.findByNameForTenant(tenantId, 'Agente');

      const user: User = await this.usersService.create({
        email: body.email,
        password: body.password,
        full_name: body.name || body.email.split('@')[0],
        role_id: agentRole?.id || null,
        tenant_id: tenantId,
      });

      const userWithRole = await this.usersService.findById(user.id);

      const token = this.authService.signToken(
        { id: userWithRole.id, email: userWithRole.email, role: userWithRole.role },
        tenantId,
      );

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
    } catch (error: any) {
      if (error?.code === '23505') {
        throw new BadRequestException('El email ya está registrado');
      }
      throw new BadRequestException(error.message || 'Error al registrar usuario');
    }
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica un usuario y retorna un token JWT válido por 7 días. ' +
      'Usa este token en el header Authorization: Bearer {token} para los demás endpoints.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'agent@example.com' },
        password: { type: 'string', example: 'password123' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  async login(@Body() body: { email: string; password: string }) {
    try {
      const user: User = await this.usersService.findByEmailWithRole(body.email);
      if (!user) {
        throw new BadRequestException('Email o contraseña inválidos');
      }

      const isValidPassword = await this.usersService.validatePassword(user, body.password);
      if (!isValidPassword) {
        throw new BadRequestException('Email o contraseña inválidos');
      }

      const token = this.authService.signToken(
        { id: user.id, email: user.email, role: user.role },
        user.tenant_id,
        user.is_platform_admin === true,
      );

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
    } catch (error: any) {
      throw new BadRequestException(error.message || 'Error al iniciar sesión');
    }
  }

  @Post('impersonate/:tenantId')
  @UseGuards(JwtAuthGuard, PlatformAdminGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Emitir un token para ver el detalle de otro espacio (solo super-admin de plataforma)',
  })
  async impersonate(@Request() req, @Param('tenantId') tenantId: string) {
    const tenant = await this.tenantsService.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException('El espacio indicado no existe');
    }
    const token = this.authService.signToken(
      { id: req.user.id, email: req.user.email, role: { name: 'admin' } as Role },
      tenant.id,
      true,
    );
    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: '7d',
      tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener información del usuario actual',
    description: 'Retorna la información del usuario autenticado basado en el JWT token.',
  })
  @ApiResponse({
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
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token inválido o expirado',
  })
  async getMe(@Request() req) {
    const user = await this.usersService.findByEmailWithRole(req.user.email);

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
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
}
