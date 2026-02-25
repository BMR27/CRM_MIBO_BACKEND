
import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';
import axios from 'axios';

@Injectable()
export class TwilioService {
  private client: Twilio;

  constructor() {
    this.client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }

  /**
   * Lista plantillas aprobadas de WhatsApp en Twilio usando Content API vía HTTP
   */
  async listApprovedWATemplates() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const url = `https://content.twilio.com/v1/WhatsApp/Templates?Status=approved`;
    const response = await axios.get(url, {
      auth: { username: accountSid, password: authToken }
    });
    return response.data.templates || [];
  }

  async sendWhatsAppTemplate({
    to,
    from,
    contentSid,
    variables = [],
  }: {
    to: string;
    from: string;
    contentSid: string;
    variables?: string[];
  }) {
    // Mapear variables a formato {"1": "valor1", "2": "valor2", ...}
    const contentVariables = {} as Record<string, string>;
    if (Array.isArray(variables)) {
      variables.forEach((val, idx) => {
        contentVariables[(idx + 1).toString()] = val;
      });
    }
    const payload = {
      to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
      from: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
      contentSid: contentSid,
      contentVariables: JSON.stringify(contentVariables),
    };
    // Log para depuración
    // eslint-disable-next-line no-console
    console.log('Twilio sendWhatsAppTemplate payload:', payload);
    return this.client.messages.create(payload);
  }
}
