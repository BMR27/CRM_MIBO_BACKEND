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
import { Controller, Post, UploadedFile, UseInterceptors, Inject, Body, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';
import { TwilioService } from '../../twilio/twilio.service';
import { ContactsService } from '../contacts/contacts.service';
import { ConversationsService } from '../conversations/conversations.service';
import { MessagesService } from './messages.service';

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
    // Usar contentSid o templateSid recibido en el body si existe, si no usar el default bienvenida_logi
    const contentSid = body.contentSid || body.templateSid || 'HX99ead19f74793c6b5f0e1777523f1815';
    const from = process.env.TWILIO_WHATSAPP_FROM!;
    const results = [];
    for (const row of data as Contacto[]) {
      try {
        const to = String(row.telefono);
        // 1. Buscar o crear contacto
        let contact = await this.contactsService.findByPhoneNumber(to);
        if (!contact) {
          contact = await this.contactsService.create({
            phone_number: to,
            name: row.nombre || to,
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
        let variablesToSend = [row.nombre || 'Usuario'];
        // Si la plantilla requiere producto, agregarlo y forzar ambos parámetros
        if (contentSid === 'HXdf73cf1db9d8dc586d94d576fa2e140c') {
          const producto = row.PRODUCTOS_A || row.PRODUCTS_A || row.producto || '';
          variablesToSend = [row.nombre || 'Usuario', producto];
        } else if (contentSid === 'HX9efa55d55fa323d5efa09d82d0a1c484') {
          // lm_buen_dia_en_entrega: nombre, orden, producto (todos como string)
          const producto = String(row.PRODUCTOS_A || row.PRODUCTS_A || row.producto || '');
          const orden = String(row.ORDEN || '');
          const nombre = String(row.nombre || 'Usuario');
          variablesToSend = [nombre, orden, producto];
        } else if ([
          'HX63433782a538101c777138bca250cc54', // lm_buen_dia_empaque
          'HX43be0016968ad04dbe7a7a2408a5d24b' // lm_buen_dia_proximo_entregar_confirma
        ].includes(contentSid)) {
          const producto = row.PRODUCTOS_A || row.PRODUCTS_A || row.producto || '';
          variablesToSend.push(producto);
        }
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
        let mensajePlantilla = '';
        if (contentSid === 'HX99ead19f74793c6b5f0e1777523f1815') {
          // bienvenida_logi
          mensajePlantilla = `Hola ${row.nombre || 'Usuario'} 👋\n¡Bienvenido/a! Estoy aquí para ayudarte con tus pedidos y soporte.`;
        } else if (contentSid === 'HX63433782a538101c777138bca250cc54') {
          // lm_buen_dia_empaque
          const producto = row.PRODUCTS_A || row.PRODUCTOS_A || row.producto || '';
          mensajePlantilla = `Buenos días, ${row.CLIENTE}. Le hablamos de Logimarket.\nRecibimos su pedido de ${producto}, con número de orden ${row.ORDEN} y se encuentra en proceso de empaque.\nLe avisaremos en cuanto esté listo para su entrega. ¡Gracias por su preferencia!`;
        } else if (contentSid === 'HX9efa55d55fa323d5efa09d82d0a1c484') {
          // lm_buen_dia_en_entrega
          const producto = row.PRODUCTOS_A || row.PRODUCTS_A || row.producto || '';
          mensajePlantilla = `Buen día, ${row.CLIENTE}. Le hablamos de Logimarket.\nSu pedido con número de orden ${row.ORDEN}, producto ${producto}, se encuentra en proceso de entrega.\nSi desea compartir alguna indicación adicional para la entrega, por favor responda a este mensaje. ¡Gracias!`;
        } else if (contentSid === 'HX43be0016968ad04dbe7a7a2408a5d24b') {
          // lm_buen_dia_proximo_entregar_confirma
          const producto = row.PRODUCTOS_A || row.PRODUCTS_A || row.producto || '';
          mensajePlantilla = `Buenos días, ${row.CLIENTE}. Le hablamos de Logimarket.\nSu pedido con número de orden ${row.ORDEN}, producto ${producto} está próximo a entregarse. ¿Puede confirmar su disponibilidad para recibirlo el día de hoy?\nQuedamos atentos a su respuesta. ¡Gracias!`;
        } else if (contentSid === 'HXdf73cf1db9d8dc586d94d576fa2e140c') {
          // lm_mensajeria_disponibilidad_paquete
          const producto = row.PRODUCTOS_A || row.PRODUCTS_A || row.producto || '';
          mensajePlantilla = `Estimado/a ${row.CLIENTE},\n\nSoy de mensajería Logimarket. Deseo que se encuentre bien.\nLe escribo porque aún tenemos su paquete de ${producto}.\nSi ya está en condiciones de recibirlo, por favor confírmenos su disponibilidad.\n\n¡Gracias!`;
        } else {
          mensajePlantilla = `Mensaje enviado.`;
        }
        await this.messagesService.create({
          conversation_id: conversation.id,
          sender_type: 'agent',
          content: mensajePlantilla,
          message_type: 'text',
          is_from_whatsapp: false,
          whatsapp_message_id: res.sid,
          created_at: new Date(),
        });
      } catch (err: any) {
        results.push({ to: String(row.telefono), status: 'error', error: err.message });
        console.log(`Error enviando a ${row.telefono}:`, err.message);
      }
    }
    console.log('Resultados de envío masivo:', results);
    return { success: true, rows: data.length, results, preview: data };
  }
}
