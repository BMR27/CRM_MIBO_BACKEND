import { Body, Controller, ForbiddenException, Get, HttpCode, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('API Keys - Integraciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api-keys')
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  private assertAdmin(req: any) {
    // Ver nota en AuthController.signup: no se usa @Roles('admin') porque el RolesGuard
    // global corre antes que los guards de método, así que req.user no existiría todavía.
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Solo un administrador puede gestionar API keys');
    }
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({
    summary: 'Generar API key',
    description: 'Genera una API key nueva para el tenant. El valor completo solo se devuelve una vez.',
  })
  @ApiBody({ schema: { type: 'object', properties: { name: { type: 'string', example: 'Sitio web principal' } }, required: ['name'] } })
  async create(@Request() req, @Body() body: { name: string }) {
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

  @Get()
  @ApiOperation({ summary: 'Listar API keys del tenant' })
  async findAll(@Request() req) {
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

  @Patch(':id/revoke')
  @ApiOperation({ summary: 'Revocar API key' })
  @ApiParam({ name: 'id', description: 'ID de la API key' })
  async revoke(@Request() req, @Param('id') id: string) {
    this.assertAdmin(req);
    await this.apiKeysService.revoke(id);
    return { success: true };
  }
}
