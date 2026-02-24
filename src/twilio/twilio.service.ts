import { Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  private client: Twilio;

  constructor() {
    this.client = new Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }

  async sendWhatsAppTemplate({
    to,
    from,
    templateSid,
    variables = [],
  }: {
    to: string;
    from: string;
    templateSid: string;
    variables?: string[];
  }) {
    return this.client.messages.create({
      to: `whatsapp:${to}`,
      from: `whatsapp:${from}`,
      contentSid: templateSid,
      contentVariables: JSON.stringify(
        variables.reduce((acc, val, idx) => {
          acc[`1`] = val; // para una variable, puedes expandir para más
          return acc;
        }, {} as Record<string, string>)
      ),
    });
  }
}
