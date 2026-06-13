interface Contacto {
  nombre: string;
  telefono: string;
  [key: string]: any;
}

// Helper para limpiar el nombre (fuera de la clase)
function getNombreSinNumero(nombre: string) {
  if (!nombre) return 'Usuario';
  // Elimina números al inicio del nombre
  return nombre.replace(/^\d+\s*/, '').trim();
}
const CUSTOMER_SERVICE_TEMPLATE_SID = 'HXf9420e6e4ff17a94fe3dfaceb7aa657b';
const CUSTOMER_SERVICE_TEMPLATE_BODY =
  '¡Hola, {{1}}! Mi nombre es {{2}} y lo contacto del departamento de atención al cliente del producto {{3}}. ¡Estoy a disposición para asistir!';

import { Controller, Post, UploadedFile, UseInterceptors, Inject, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
  @UseGuards(JwtAuthGuard)
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
            templateSid: { type: 'string', example: CUSTOMER_SERVICE_TEMPLATE_SID },
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
          required: ['templateSid', 'contacts'],
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
    // En producción solo se permite la plantilla autorizada para campañas masivas.
    const contentSid = CUSTOMER_SERVICE_TEMPLATE_SID;
    const campaignId = String(body.campaignId || `bulk_${Date.now()}`);
    const campaignName = String(body.campaignName || 'Campaña').trim() || 'Campaña';
    const campaignCode = String(body.campaignCode || campaignId).trim() || campaignId;
    const from = process.env.TWILIO_WHATSAPP_FROM!;
    const results = [];
    for (const row of data as Contacto[]) {
      try {
        const to = String(row.telefono || row.PHONE_A || row.phone || row.telefono_cliente || '').trim();
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
          console.log('Agente asignado a la conversación:', assigned_agent_id);
          conversation = await this.conversationsService.create({ contact_id: contact.id, assigned_agent_id });
        }
        // 3. Enviar mensaje por WhatsApp
        const cliente = String(row.CLIENTE || row.nombre || 'Usuario').trim() || 'Usuario';
        const asesor = String(row.ASESOR || 'Juan Pérez').trim() || 'Juan Pérez';
        const producto = String(row.PRODUCTOS_A || row.PRODUCTS_A || row.producto || '').trim();
        const variablesToSend = [cliente, asesor, producto];
        // Log explícito para depuración
        console.log('Variables enviadas a Twilio:', variablesToSend);
        const res = await this.twilioService.sendWhatsAppTemplate({
          to,
          from,
          contentSid,
          variables: variablesToSend,
        });
        results.push({ to, status: 'sent', sid: res.sid });
        console.log(`Mensaje enviado a ${to}: SID ${res.sid}`);
        // 4. Registrar mensaje en la conversación usando la plantilla y parámetros
        const mensajePlantilla = CUSTOMER_SERVICE_TEMPLATE_BODY
          .replace('{{1}}', cliente)
          .replace('{{2}}', asesor)
          .replace('{{3}}', producto);
        await this.messagesService.create({
          conversation_id: conversation.id,
          sender_type: 'agent',
          content: mensajePlantilla,
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
        const errorTo = String(row.telefono || row.PHONE_A || row.phone || row.telefono_cliente || '').trim();
        results.push({ to: errorTo, status: 'error', error: err.message });
        console.log(`Error enviando a ${errorTo}:`, err.message);
      }
    }
    console.log('Resultados de envío masivo:', results);
    return { success: true, rows: data.length, results, preview: data };
  }
}
