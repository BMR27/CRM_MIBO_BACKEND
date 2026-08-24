interface Contacto {
  nombre: string;
  telefono: string;
  [key: string]: any;
}

import { Controller, Post, UploadedFile, UseInterceptors, Inject, Body, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantFeatureGuard, RequireTenantFeature } from '../../common/tenant/tenant-feature.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';
import { TwilioService } from '../../twilio/twilio.service';
import { ContactsService } from '../contacts/contacts.service';
import { ConversationsService } from '../conversations/conversations.service';
import { MessagesService } from './messages.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Bulk Messages - Envíos masivos')
@ApiBearerAuth()
@Controller('messages')
export class MessagesBulkController {
  constructor(
    @Inject(TwilioService) private readonly twilioService: TwilioService,
    @Inject(ContactsService) private readonly contactsService: ContactsService,
    @Inject(ConversationsService) private readonly conversationsService: ConversationsService,
    @Inject(MessagesService) private readonly messagesService: MessagesService,
  ) {}

  @Post('bulk')
  @UseGuards(JwtAuthGuard, TenantFeatureGuard)
  @RequireTenantFeature('bulk_messaging_enabled')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Enviar mensajes masivos por WhatsApp',
    description:
      'Recibe contactos por JSON o archivo Excel, envía una plantilla aprobada por Twilio y registra la conversación/mensaje con metadata de campaña.',
  })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({
    schema: {
      oneOf: [
        {
          type: 'object',
          properties: {
            campaignId: { type: 'string', example: 'bulk_1710000000000' },
            campaignCode: { type: 'string', example: 'CMP-20260612094500' },
            campaignName: { type: 'string', example: 'Recuperación entregas junio' },
            campaignNotes: { type: 'string', example: 'Segmento de pedidos pendientes' },
            templateSid: { type: 'string', example: 'HXf9420e6e4ff17a94fe3dfaceb7aa657b' },
            templateParamMap: {
              type: 'object',
              description: 'Mapa índice de variable de Twilio ({{1}}, {{2}}...) → nombre de columna en cada contacto',
              example: { '1': 'CLIENTE', '2': 'ASESOR', '3': 'PRODUCTS_A' },
            },
            templateParamFallbacks: {
              type: 'object',
              description: 'Valor por defecto por índice de variable si el contacto no trae la columna',
              example: { '2': 'Juan Pérez' },
            },
            contacts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  CLIENTE: { type: 'string', example: 'Juan Pérez' },
                  PHONE_A: { type: 'string', example: '+525512345678' },
                  ORDEN: { type: 'string', example: 'ORD-123' },
                  PRODUCTS_A: { type: 'string', example: 'Producto de prueba' },
                },
              },
            },
          },
          required: ['templateSid', 'templateParamMap', 'contacts'],
        },
        {
          type: 'object',
          properties: {
            file: { type: 'string', format: 'binary' },
            templateSid: { type: 'string' },
            campaignName: { type: 'string' },
          },
          required: ['file', 'templateSid'],
        },
      ],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Resultado del envío masivo',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        rows: { type: 'number', example: 25 },
        results: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  async uploadBulk(@UploadedFile() file: Express.Multer.File, @Body() body?: any, @Req() req?: any) {
    let data: Contacto[] = [];
    // Si se envía archivo Excel
    if (file) {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      data = XLSX.utils.sheet_to_json(sheet);
      console.log('Contactos importados desde Excel:', data);
    }
    // Si se envía JSON en el body
    else if (body && Array.isArray(body.contacts)) {
      data = body.contacts;
      console.log('Contactos importados desde JSON body:', data);
    }
    // Si se envía JSON sin Content-Type correcto (por ejemplo, desde fetch)
    else if (req && req.body && Array.isArray(req.body.contacts)) {
      data = req.body.contacts;
      console.log('Contactos importados desde req.body:', data);
    }
    if (!data || data.length === 0) {
      console.log('No contacts provided');
      return { error: 'No contacts provided' };
    }

    const contentSid = String(body?.templateSid || '').trim();
    if (!contentSid) {
      throw new BadRequestException('templateSid es requerido');
    }
    if (!this.twilioService.isTemplateAllowed(contentSid)) {
      throw new BadRequestException('La plantilla indicada no está permitida para envíos masivos');
    }
    const templateParamMap: Record<string, string> = body?.templateParamMap || {};
    const templateParamFallbacks: Record<string, string> = body?.templateParamFallbacks || {};
    const paramIndexes = Object.keys(templateParamMap).sort((a, b) => Number(a) - Number(b));
    if (paramIndexes.length === 0) {
      throw new BadRequestException('templateParamMap es requerido');
    }

    const campaignId = String(body.campaignId || `bulk_${Date.now()}`);
    const campaignName = String(body.campaignName || 'Campaña').trim() || 'Campaña';
    const campaignCode = String(body.campaignCode || campaignId).trim() || campaignId;
    const from = await this.twilioService.getDefaultWhatsappFrom();
    if (!from) {
      return { error: 'WhatsApp (Twilio) no está configurado para este espacio de trabajo' };
    }
    const results = [];
    for (const row of data as Contacto[]) {
      const to = String(row.telefono || row.PHONE_A || row.phone || row.telefono_cliente || '').trim();
      try {
        if (!to) {
          throw new Error('Contacto sin telefono/PHONE_A');
        }
        // 1. Buscar o crear contacto
        let contact = await this.contactsService.findByPhoneNumber(to);
        if (!contact) {
          contact = await this.contactsService.create({
            phone_number: to,
            name: row.CLIENTE || row.nombre || to,
          });
        }
        // 2. Buscar o crear conversación
        let conversations = await this.conversationsService.findByContact(contact.id);
        let conversation;
        if (conversations && conversations.length > 0) {
          conversation = conversations[0];
        } else {
          // Asignar el agente logueado
          const assigned_agent_id = req?.user?.id;
          conversation = await this.conversationsService.create({ contact_id: contact.id, assigned_agent_id });
        }
        // 3. Resolver variables de la plantilla en orden ({{1}}, {{2}}, ...) desde la fila o el fallback
        const variablesToSend: string[] = [];
        for (const idx of paramIndexes) {
          const campo = templateParamMap[idx];
          let valor = String(row[campo] ?? '').trim();
          if (!valor && campo === 'ASESOR') {
            valor = String(req?.user?.name || req?.user?.email || '').trim();
          }
          if (!valor) {
            valor = String(templateParamFallbacks[idx] ?? '').trim();
          }
          if (!valor) {
            throw new Error(`Falta el valor de ${campo} (variable {{${idx}}})`);
          }
          variablesToSend.push(valor);
        }
        const res = await this.twilioService.sendWhatsAppTemplate({
          to,
          from,
          contentSid,
          variables: variablesToSend,
        });
        results.push({ to, status: 'sent', sid: res.sid });
        // 4. Registrar mensaje en la conversación
        await this.messagesService.create({
          conversation_id: conversation.id,
          sender_type: 'agent',
          content: `Plantilla enviada (${contentSid}): ${variablesToSend.join(' | ')}`,
          message_type: 'text',
          is_from_whatsapp: false,
          whatsapp_message_id: res.sid,
          metadata: {
            campaignId,
            campaignName,
            campaignCode,
            templateSid: contentSid,
            source: 'bulk',
            send: {
              ok: true,
              externalMessageId: res.sid,
              to,
            },
          },
          created_at: new Date(),
        });
      } catch (err: any) {
        results.push({ to, status: 'error', error: err.message });
      }
    }
    return { success: true, rows: data.length, results, preview: data };
  }
}
