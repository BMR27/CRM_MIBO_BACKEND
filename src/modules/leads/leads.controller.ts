import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards, ValidationPipe } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiBearerAuth, ApiBody, ApiHeader, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreatePublicLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiKeyGuard } from '../api-keys/guards/api-key.guard';

@ApiTags('Leads')
@Controller()
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post('public/leads')
  @UseGuards(ApiKeyGuard, ThrottlerGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @ApiHeader({ name: 'X-API-Key', description: 'API key del tenant' })
  @ApiOperation({
    summary: 'Capturar lead (público, vía API key)',
    description: 'Endpoint para integrar formularios/sistemas externos. Autenticado con X-API-Key, no con JWT.',
  })
  @ApiBody({ type: CreatePublicLeadDto })
  async createPublicLead(@Body(ValidationPipe) dto: CreatePublicLeadDto, @Req() req: any) {
    const lead = await this.leadsService.createFromPublic(dto, `api-key:${req.user.apiKeyId}`);
    return { success: true, lead: { id: lead.id, status: lead.status, created_at: lead.created_at } };
  }

  @Get('leads')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar leads del tenant' })
  async findAll() {
    return this.leadsService.findAll();
  }

  @Patch('leads/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar estado de un lead' })
  @ApiParam({ name: 'id', description: 'ID del lead' })
  @ApiBody({ type: UpdateLeadDto })
  async update(@Param('id') id: string, @Body(ValidationPipe) dto: UpdateLeadDto) {
    return this.leadsService.update(id, dto);
  }

  @Post('leads/:id/convert')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Convertir un lead en contacto del CRM',
    description:
      'Crea (o reutiliza) un Contact a partir del phone_number del lead y lo vincula via contact_id. ' +
      'Esto NO crea una orden: las órdenes son un recurso aparte que se crea explícitamente con ' +
      'POST /api/orders usando el contact_id devuelto aquí.',
  })
  @ApiParam({ name: 'id', description: 'ID del lead' })
  @ApiResponse({
    status: 201,
    description: 'Lead convertido (o ya estaba convertido)',
    schema: {
      type: 'object',
      properties: {
        lead: { type: 'object', description: 'Lead actualizado, status="converted", incluye contact_id' },
        contact: { type: 'object', description: 'Contact creado o reutilizado' },
        alreadyConverted: { type: 'boolean', description: 'true si el lead ya tenía contact_id previamente' },
      },
    },
  })
  async convert(@Param('id') id: string) {
    return this.leadsService.convertToContact(id);
  }
}
