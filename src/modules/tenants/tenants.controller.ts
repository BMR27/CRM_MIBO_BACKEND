import { BadRequestException, Body, Controller, ForbiddenException, Get, Patch, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tenants - Espacio de trabajo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

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
}
