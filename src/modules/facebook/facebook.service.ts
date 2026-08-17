import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ContactsService } from '../contacts/contacts.service';
import { ConversationsService } from '../conversations/conversations.service';
import { MessagesService } from '../messages/messages.service';
import { TenantContext } from '../../common/tenant/tenant-context';
import { FacebookIntegrationsService } from './facebook-integrations.service';

const CHANNEL = 'facebook';

@Injectable()
export class FacebookService {
  private readonly logger = new Logger(FacebookService.name);

  constructor(
    private integrationsService: FacebookIntegrationsService,
    private contactsService: ContactsService,
    private conversationsService: ConversationsService,
    private messagesService: MessagesService,
  ) {}

  async resolveTenantForWebhook(body: any): Promise<string | null> {
    for (const entry of body?.entry || []) {
      const pageId = entry?.id;
      if (pageId) {
        const tenantId = await this.integrationsService.findTenantIdByPageId(String(pageId));
        if (tenantId) return tenantId;
      }
    }
    return null;
  }

  async resolveTenantForVerifyToken(token: string): Promise<string | null> {
    return this.integrationsService.findTenantIdByVerifyToken(token);
  }

  async handleWebhook(body: any): Promise<void> {
    try {
      for (const entry of body?.entry || []) {
        for (const event of entry?.messaging || []) {
          const senderPsid = event?.sender?.id;
          const messageText = event?.message?.text;
          const messageId = event?.message?.mid;

          if (!senderPsid || !messageId) continue;
          if (event?.message?.is_echo) continue; // ignorar eco de mensajes enviados por nosotros mismos

          await this.processIncomingMessage(String(senderPsid), messageText || '', String(messageId));
        }
      }
    } catch (error) {
      this.logger.error('Error processing Facebook webhook:', error);
    }
  }

  private async processIncomingMessage(psid: string, text: string, messageId: string): Promise<void> {
    try {
      let conversation = null;
      const existing = await this.conversationsService.findByExternalUserId(CHANNEL, psid);
      if (existing && existing.length > 0) {
        conversation = existing[0];
      } else {
        const contact = await this.contactsService.create({
          name: `Facebook ${psid.slice(-6)}`,
          phone_number: undefined,
        } as any);
        conversation = await this.conversationsService.create({
          contact_id: contact.id,
          channel: CHANNEL,
          external_user_id: psid,
        } as any);
      }

      await this.messagesService.createIfNotExists({
        conversation_id: conversation.id,
        sender_type: 'contact' as any,
        content: text,
        message_type: 'text' as any,
        is_from_whatsapp: false,
        whatsapp_message_id: messageId,
      });

      await this.conversationsService.update(conversation.id, {
        priority: conversation.priority || 'medium',
        last_message_at: new Date(),
      } as any);

      this.logger.log(`Facebook message ${messageId} processed from ${psid}`);
    } catch (error) {
      this.logger.error('Error processing Facebook incoming message:', error);
    }
  }

  async sendMessage(psid: string, text: string): Promise<{ success: boolean; error?: string }> {
    const tenantId = TenantContext.getTenantId();
    const config = await this.integrationsService.getConfigForTenant(tenantId);
    if (!config) {
      throw new BadRequestException('Facebook Messenger no está configurado para este espacio de trabajo');
    }

    const response = await fetch(
      `https://graph.facebook.com/v19.0/me/messages?access_token=${encodeURIComponent(config.pageAccessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: psid },
          message: { text },
        }),
      },
    );

    const data: any = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { success: false, error: data?.error?.message || 'Failed to send message' };
    }

    const conversations = await this.conversationsService.findByExternalUserId(CHANNEL, psid);
    if (conversations && conversations.length > 0) {
      await this.messagesService.create({
        conversation_id: conversations[0].id,
        sender_type: 'agent',
        content: text,
        message_type: 'text',
        is_from_whatsapp: false,
        whatsapp_message_id: data?.message_id,
      });
    }

    return { success: true };
  }
}
