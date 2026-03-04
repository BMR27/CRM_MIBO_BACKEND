interface Contacto {
  nombre: string;
  telefono: string;
}

// Helper para limpiar el nombre (fuera de la clase)
function getNombreSinNumero(nombre: string) {
  if (!nombre) return 'Usuario';
  // Elimina números al inicio del nombre
  return nombre.replace(/^\d+\s*/, '').trim();
}
import { Controller, Post, UploadedFile, UseInterceptors, Inject, Body, Req } from '@nestjs/common';
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
    // Configuración de la plantilla aprobada
    const contentSid = 'HX99ead19f74793c6b5f0e1777523f1815'; // bienvenido_logi
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
          conversation = await this.conversationsService.create({ contact_id: contact.id });
        }
        // 3. Enviar mensaje por WhatsApp
        const res = await this.twilioService.sendWhatsAppTemplate({
          to,
          from,
          contentSid,
          variables: [row.nombre || 'Usuario'],
        });
        results.push({ to, status: 'sent', sid: res.sid });
        console.log(`Mensaje enviado a ${to}: SID ${res.sid}`);
        // 4. Registrar mensaje en la conversación
        await this.messagesService.create({
          conversation_id: conversation.id,
          sender_type: 'agent',
          content: `Hola ${row.nombre || 'Usuario'} 👋\n¡Bienvenido/a! Estoy aquí para ayudarte con tus pedidos y soporte.`,
          message_type: 'text',
          is_from_whatsapp: false,
          whatsapp_message_id: res.sid,
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
