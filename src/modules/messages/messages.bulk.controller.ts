interface Contacto {
  nombre: string;
  telefono: string;
  [key: string]: any;
}

import { Controller, Post, UploadedFile, UseInterceptors, Inject, Body, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantFeatureGuard, RequireTenantFeature } from '../../common/tenant/tenant-feature.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignRecipient } from './entities/campaign-recipient.entity';
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
    @InjectRepository(CampaignRecipient)
    private readonly campaignRecipientsRepository: Repository<CampaignRecipient>,
  ) {}

  /**
   * Deja constancia de un destinatario en la bitácora de la campaña. Nunca debe
   * interrumpir el envío: si la bitácora falla, se registra en consola y se sigue.
   */
  private async logRecipient(data: Partial<CampaignRecipient>) {
    try {
      await this.campaignRecipientsRepository.save(
        this.campaignRecipientsRepository.create(data),
      );
    } catch (error: any) {
      console.error('[bulk] No se pudo registrar el destinatario en la bitácora:', error?.message);
    }
  }

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
    const templateBody = String(body?.templateBody || '').trim();
    const templateName = String(body?.templateName || '').trim();
    const paramIndexes = Object.keys(templateParamMap).sort((a, b) => Number(a) - Number(b));
    if (paramIndexes.length === 0) {
      throw new BadRequestException('templateParamMap es requerido');
    }

    // Arma el texto completo de la plantilla con las variables ya resueltas, para que
    // el chat muestre lo que realmente recibió el cliente y no solo un placeholder.
    const renderTemplateBody = (values: string[]) => {
      if (!templateBody) return null;
      let rendered = templateBody;
      paramIndexes.forEach((idx, i) => {
        rendered = rendered.split(`{{${idx}}}`).join(values[i] ?? '');
      });
      return rendered;
    };

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
        const resolvedContent =
          renderTemplateBody(variablesToSend) || `Plantilla enviada (${contentSid}): ${variablesToSend.join(' | ')}`;
        await this.messagesService.create({
          conversation_id: conversation.id,
          sender_type: 'agent',
          content: resolvedContent,
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
        // Bitácora propia: sobrevive a que luego se borre la conversación o el contacto.
        await this.logRecipient({
          tenant_id: req?.user?.tenantId,
          campaign_id: campaignId,
          campaign_code: campaignCode,
          campaign_name: campaignName,
          template_sid: contentSid,
          template_name: templateName || null,
          contact_id: contact.id,
          conversation_id: conversation.id,
          contact_name: contact.name || null,
          phone_number: to,
          status: 'sent',
          message_sid: res.sid,
          content: resolvedContent,
        });
      } catch (err: any) {
        // Los fallos por contacto solo viajaban en la respuesta: sin rastro en los logs
        // del servidor no había forma de diagnosticar una campaña que "se envió" pero no
        // quedó registrada. Se loguea con el código de campaña para poder correlacionar.
        console.error(
          `[bulk][${campaignCode}] Falló el contacto ${to || '(sin número)'}: ${err?.message}`,
          err?.stack,
        );
        // Un fallo también deja constancia: antes el destinatario desaparecía del detalle
        // y la campaña decía "N fallidos" sin poder decir quiénes ni por qué.
        await this.logRecipient({
          tenant_id: req?.user?.tenantId,
          campaign_id: campaignId,
          campaign_code: campaignCode,
          campaign_name: campaignName,
          template_sid: contentSid,
          template_name: templateName || null,
          contact_name: String(row.CLIENTE || row.nombre || '') || null,
          phone_number: to || null,
          status: 'failed',
          error: String(err?.message || 'Error desconocido'),
        });
        results.push({ to, status: 'error', error: err.message });
      }
    }
    return { success: true, rows: data.length, results, preview: data };
  }
}
