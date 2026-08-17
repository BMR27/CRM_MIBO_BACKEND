import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FacebookService } from './facebook.service';
import { FacebookIntegrationsService } from './facebook-integrations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantContext } from '../../common/tenant/tenant-context';

@ApiTags('Facebook - Messenger Integration')
@Controller('facebook')
export class FacebookController {
  constructor(
    private facebookService: FacebookService,
    private integrationsService: FacebookIntegrationsService,
  ) {}

  @Get('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verificar webhook de Facebook Messenger (hub.challenge)' })
  @ApiQuery({ name: 'hub.mode', required: false })
  @ApiQuery({ name: 'hub.verify_token', required: false })
  @ApiQuery({ name: 'hub.challenge', required: false })
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const tenantId = token ? await this.facebookService.resolveTenantForVerifyToken(token) : null;
    if (mode === 'subscribe' && token && tenantId) {
      return challenge;
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Recibir mensajes de Facebook Messenger' })
  async handleWebhook(@Body() body: any, @Res() res: Response): Promise<void> {
    const tenantId = await this.facebookService.resolveTenantForWebhook(body);
    if (tenantId) {
      await TenantContext.run({ tenantId }, async () => {
        await this.facebookService.handleWebhook(body);
      });
    }
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({ success: true }));
  }

  @Post('send')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Enviar mensaje por Facebook Messenger' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { psid: { type: 'string' }, message: { type: 'string' } },
      required: ['psid', 'message'],
    },
  })
  async sendMessage(@Body() body: { psid: string; message: string }) {
    return this.facebookService.sendMessage(body.psid, body.message);
  }

  @Get('integration')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener la configuración de Facebook del tenant (sin secretos)' })
  async getIntegration() {
    const integration = await this.integrationsService.getForCurrentTenant();
    if (!integration) return null;
    return {
      page_id: integration.page_id,
      verify_token: integration.verify_token,
      is_active: integration.is_active,
      has_page_access_token: Boolean(integration.page_access_token_encrypted),
    };
  }

  @Patch('integration')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Guardar la configuración de Facebook del tenant' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { page_id: { type: 'string' }, page_access_token: { type: 'string' } },
      required: ['page_id'],
    },
  })
  async saveIntegration(@Request() req, @Body() body: { page_id: string; page_access_token?: string }) {
    const integration = await this.integrationsService.upsertForCurrentTenant(req.user.tenantId, body);
    return {
      page_id: integration.page_id,
      verify_token: integration.verify_token,
      is_active: integration.is_active,
    };
  }
}
