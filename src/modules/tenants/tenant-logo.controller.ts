import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import type { Response } from 'express';
import { TenantsService } from './tenants.service';

/**
 * Sirve el logo del tenant como imagen pública (sin JWT): lo consume un <img src>
 * directo en el navegador, que no manda Authorization. Separado de TenantsController
 * porque ese tiene JwtAuthGuard a nivel de clase.
 */
@ApiExcludeController()
@Controller('tenants')
export class TenantLogoController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get(':id/branding-logo')
  async getBrandingLogo(@Param('id') id: string, @Res() res: Response) {
    const logo = await this.tenantsService.getBrandingLogo(id);
    if (!logo) {
      throw new NotFoundException('Este espacio no tiene un logo subido');
    }
    res.setHeader('Content-Type', logo.mime);
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(logo.data);
  }
}
