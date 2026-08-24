import { BadRequestException, Injectable } from '@nestjs/common';
import { Twilio } from 'twilio';
import axios from 'axios';
import { TenantContext } from '../common/tenant/tenant-context';
import { WhatsappIntegrationsService } from '../modules/whatsapp/whatsapp-integrations.service';

@Injectable()
export class TwilioService {
  private readonly allowedWATemplates = [
    { name: 'customer_service_intro_v1', sid: 'HXf9420e6e4ff17a94fe3dfaceb7aa657b' },
    { name: 'pedido_enviado_v1', sid: 'HX36751a5be358338dd5082fa394b515f5' },
  ];

  constructor(private whatsappIntegrationsService: WhatsappIntegrationsService) {}

  private async getCredentials(): Promise<{ accountSid: string; authToken: string; whatsappFrom?: string }> {
    const tenantId = TenantContext.getTenantId();
    const config = await this.whatsappIntegrationsService.getConfigForTenant(tenantId);
    if (!config?.twilioAccountSid || !config?.twilioAuthToken) {
      throw new BadRequestException('Twilio no está configurado para este espacio de trabajo');
    }
    return {
      accountSid: config.twilioAccountSid,
      authToken: config.twilioAuthToken,
      whatsappFrom: config.twilioWhatsappNumber,
    };
  }

  private async getClient(): Promise<Twilio> {
    const { accountSid, authToken } = await this.getCredentials();
    return new Twilio(accountSid, authToken);
  }

  /**
   * Lista plantillas aprobadas de WhatsApp en Twilio usando Content API vía HTTP
   */
  async listApprovedWATemplates(serviceSid?: string) {
    const { accountSid, authToken } = await this.getCredentials();
    let url = `https://content.twilio.com/v1/WhatsApp/Templates?Status=approved`;
    if (serviceSid) {
      url = `https://content.twilio.com/v1/Services/${serviceSid}/Templates?Status=approved`;
    }
    try {
      const response = await axios.get(url, {
        auth: { username: accountSid, password: authToken },
      });
      const templates = response.data.templates || [];
      return templates.filter((template: any) => {
        const name = String(template?.friendly_name || template?.name || '').trim();
        const sid = String(template?.sid || '').trim();
        return this.allowedWATemplates.some((allowed) => name === allowed.name || sid === allowed.sid);
      });
    } catch (err: any) {
      console.error('Twilio API error:', err?.response?.data || err?.message || err);
      throw err;
    }
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
    const client = await this.getClient();
    let contentVariables = {} as Record<string, string>;
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
    return client.messages.create(payload);
  }

  /**
   * Envía mensaje WhatsApp usando ContentSid y ContentVariables exactamente como el cURL
   */
  async sendWhatsAppTemplateViaHttp({
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
    const { accountSid, authToken } = await this.getCredentials();
    const contentVariables: Record<string, string> = {};
    if (Array.isArray(variables)) {
      variables.forEach((val, idx) => {
        contentVariables[(idx + 1).toString()] = val;
      });
    }
    const data = new URLSearchParams();
    data.append('To', to.startsWith('whatsapp:') ? to : `whatsapp:${to}`);
    data.append('From', from.startsWith('whatsapp:') ? from : `whatsapp:${from}`);
    data.append('ContentSid', contentSid);
    data.append('ContentVariables', JSON.stringify(contentVariables));

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const response = await axios.post(url, data, {
      auth: { username: accountSid, password: authToken },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  }

  async sendWhatsAppMedia({
    to,
    from,
    mediaUrl,
    body,
  }: {
    to: string;
    from: string;
    mediaUrl: string;
    body?: string;
  }) {
    const client = await this.getClient();
    const payload = {
      to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
      from: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
      mediaUrl: [mediaUrl],
      ...(body && body.trim() ? { body: body.trim() } : {}),
    };
    return client.messages.create(payload);
  }

  async downloadFirstMediaByMessageSid(messageSid: string) {
    const { accountSid, authToken } = await this.getCredentials();
    const client = new Twilio(accountSid, authToken);

    const mediaList = await client.messages(messageSid).media.list({ limit: 1 });
    if (!mediaList || mediaList.length === 0) {
      throw new Error('No media found for this message');
    }

    const media = mediaList[0] as any;
    const mediaUri: string = String(media?.uri || '');
    if (!mediaUri) {
      throw new Error('Media URI not found');
    }

    // Twilio media URI ends with .json; removing it returns the raw media bytes.
    const rawMediaUrl = `https://api.twilio.com${mediaUri.replace(/\.json$/i, '')}`;
    const resp = await axios.get(rawMediaUrl, {
      auth: { username: accountSid, password: authToken },
      responseType: 'arraybuffer',
    });

    const contentType = String(resp.headers['content-type'] || media?.contentType || 'application/octet-stream');
    const contentDisposition = String(resp.headers['content-disposition'] || '');

    return {
      data: Buffer.from(resp.data),
      contentType,
      contentDisposition,
    };
  }

  async getDefaultWhatsappFrom(): Promise<string | undefined> {
    const { whatsappFrom } = await this.getCredentials();
    return whatsappFrom ? `whatsapp:${whatsappFrom}` : undefined;
  }
}
