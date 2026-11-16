import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PlatformAdminGuard } from '../../common/auth/platform-admin.guard';

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_LOGO_MIME = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']);

@ApiTags('Tenants - Espacio de trabajo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get()
  @UseGuards(PlatformAdminGuard)
  @ApiOperation({ summary: 'Listar todos los espacios de trabajo (solo super-admin de plataforma)' })
  async getAll() {
    return this.tenantsService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtener el tenant (espacio de trabajo) del usuario autenticado' })
  async getMe(@Request() req) {
    const tenant = await this.tenantsService.findById(req.user.tenantId);
    return tenant;
  }

  @Patch('me')
  @ApiOperation({ summary: 'Renombrar el espacio de trabajo (solo admin)' })
  @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string', example: 'Mi Empresa' } }, required: ['name'] } })
  async updateMe(@Request() req, @Body() body: { name: string }) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Solo un administrador puede renombrar el espacio de trabajo');
    }
    const name = String(body.name || '').trim();
    if (!name) {
      throw new BadRequestException('El nombre no puede estar vacío');
    }
    return this.tenantsService.renameTenant(req.user.tenantId, name);
  }

  @Patch('me/features')
  @ApiOperation({ summary: 'Habilitar/deshabilitar mensajería masiva y plantillas de WhatsApp para el espacio (solo admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        bulk_messaging_enabled: { type: 'boolean' },
        wa_templates_enabled: { type: 'boolean' },
      },
    },
  })
  async updateFeatures(
    @Request() req,
    @Body() body: { bulk_messaging_enabled?: boolean; wa_templates_enabled?: boolean },
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Solo un administrador puede cambiar las funciones habilitadas del espacio');
    }
    return this.tenantsService.updateFeatureFlags(req.user.tenantId, body);
  }

  @Patch('me/branding')
  @ApiOperation({ summary: 'Configurar branding del espacio: logo, color de acento y nombre para mostrar (solo admin)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        branding_logo_url: { type: 'string', nullable: true, example: 'https://miempresa.com/logo.png' },
        branding_accent_color: { type: 'string', nullable: true, example: '#2563EB' },
        branding_display_name: { type: 'string', nullable: true, example: 'Mi Empresa' },
      },
    },
  })
  async updateBranding(
    @Request() req,
    @Body()
    body: {
      branding_logo_url?: string | null;
      branding_accent_color?: string | null;
      branding_display_name?: string | null;
    },
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Solo un administrador puede configurar el branding del espacio');
    }
    return this.tenantsService.updateBranding(req.user.tenantId, body);
  }

  @Post('me/branding/logo')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir el logo del espacio como archivo de imagen (solo admin)' })
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  async uploadBrandingLogo(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Solo un administrador puede configurar el branding del espacio');
    }
    if (!file) {
      throw new BadRequestException('Falta el archivo de logo');
    }
    if (!ALLOWED_LOGO_MIME.has(file.mimetype)) {
      throw new BadRequestException('El logo debe ser PNG, JPG, WEBP o SVG');
    }
    if (file.size > MAX_LOGO_BYTES) {
      throw new BadRequestException('El logo no puede pesar más de 2MB');
    }
    return this.tenantsService.saveBrandingLogo(req.user.tenantId, file.buffer, file.mimetype);
  }

  @Patch(':id/modules')
  @UseGuards(PlatformAdminGuard)
  @ApiOperation({ summary: 'Habilitar/deshabilitar módulos opcionales del sidebar para un espacio (solo super-admin de plataforma)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        module_citas_enabled: { type: 'boolean' },
        module_agentes_enabled: { type: 'boolean' },
        module_leads_enabled: { type: 'boolean' },
        module_docs_api_enabled: { type: 'boolean' },
      },
    },
  })
  async updateModules(
    @Param('id') id: string,
    @Body()
    body: {
      module_citas_enabled?: boolean;
      module_agentes_enabled?: boolean;
      module_leads_enabled?: boolean;
      module_docs_api_enabled?: boolean;
    },
  ) {
    return this.tenantsService.updateModules(id, body);
  }

  @Get('me/webhook')
  @ApiOperation({ summary: 'Ver configuración de webhook saliente del espacio (solo admin)' })
  async getWebhook(@Request() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Solo un administrador puede ver la configuración de webhooks');
    }
    const tenant = await this.tenantsService.findById(req.user.tenantId);
    return {
      webhook_url: tenant?.webhook_url || null,
      webhook_events_enabled: tenant?.webhook_events_enabled || false,
      has_secret: Boolean(tenant?.webhook_secret_encrypted),
    };
  }

  @Patch('me/webhook')
  @ApiOperation({
    summary: 'Configurar webhook saliente del espacio (solo admin)',
    description:
      'Registra la URL donde este espacio quiere recibir eventos de estado de mensajes de WhatsApp ' +
      '(enviado, entregado, leído, fallido). Al habilitarlo por primera vez se genera un secreto de firma ' +
      'que se devuelve una sola vez en la respuesta (campo webhook_secret): guárdalo, no se puede volver a mostrar.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        webhook_url: { type: 'string', nullable: true, example: 'https://miempresa.com/webhooks/mibo' },
        enabled: { type: 'boolean', example: true },
      },
    },
  })
  async updateWebhook(
    @Request() req,
    @Body() body: { webhook_url?: string | null; enabled?: boolean },
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Solo un administrador puede configurar el webhook del espacio');
    }
    const { tenant, plainSecret } = await this.tenantsService.updateWebhookConfig(req.user.tenantId, body);
    return {
      webhook_url: tenant.webhook_url,
      webhook_events_enabled: tenant.webhook_events_enabled,
      has_secret: Boolean(tenant.webhook_secret_encrypted),
      ...(plainSecret
        ? {
            webhook_secret: plainSecret,
            warning: 'Guarda este secreto ahora: no volverá a mostrarse completo.',
          }
        : {}),
    };
  }

  @Post('me/webhook/rotate-secret')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Rotar el secreto de firma del webhook saliente (solo admin)',
    description: 'Invalida el secreto anterior y devuelve uno nuevo una sola vez.',
  })
  async rotateWebhookSecret(@Request() req) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Solo un administrador puede rotar el secreto del webhook');
    }
    const plainSecret = await this.tenantsService.rotateWebhookSecret(req.user.tenantId);
    return {
      webhook_secret: plainSecret,
      warning: 'Guarda este secreto ahora: no volverá a mostrarse completo.',
    };
  }
}
