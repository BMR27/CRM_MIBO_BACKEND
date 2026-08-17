"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FacebookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookService = void 0;
const common_1 = require("@nestjs/common");
const contacts_service_1 = require("../contacts/contacts.service");
const conversations_service_1 = require("../conversations/conversations.service");
const messages_service_1 = require("../messages/messages.service");
const tenant_context_1 = require("../../common/tenant/tenant-context");
const facebook_integrations_service_1 = require("./facebook-integrations.service");
const CHANNEL = 'facebook';
let FacebookService = FacebookService_1 = class FacebookService {
    constructor(integrationsService, contactsService, conversationsService, messagesService) {
        this.integrationsService = integrationsService;
        this.contactsService = contactsService;
        this.conversationsService = conversationsService;
        this.messagesService = messagesService;
        this.logger = new common_1.Logger(FacebookService_1.name);
    }
    async resolveTenantForWebhook(body) {
        for (const entry of body?.entry || []) {
            const pageId = entry?.id;
            if (pageId) {
                const tenantId = await this.integrationsService.findTenantIdByPageId(String(pageId));
                if (tenantId)
                    return tenantId;
            }
        }
        return null;
    }
    async resolveTenantForVerifyToken(token) {
        return this.integrationsService.findTenantIdByVerifyToken(token);
    }
    async handleWebhook(body) {
        try {
            for (const entry of body?.entry || []) {
                for (const event of entry?.messaging || []) {
                    const senderPsid = event?.sender?.id;
                    const messageText = event?.message?.text;
                    const messageId = event?.message?.mid;
                    if (!senderPsid || !messageId)
                        continue;
                    if (event?.message?.is_echo)
                        continue; // ignorar eco de mensajes enviados por nosotros mismos
                    await this.processIncomingMessage(String(senderPsid), messageText || '', String(messageId));
                }
            }
        }
        catch (error) {
            this.logger.error('Error processing Facebook webhook:', error);
        }
    }
    async processIncomingMessage(psid, text, messageId) {
        try {
            let conversation = null;
            const existing = await this.conversationsService.findByExternalUserId(CHANNEL, psid);
            if (existing && existing.length > 0) {
                conversation = existing[0];
            }
            else {
                const contact = await this.contactsService.create({
                    name: `Facebook ${psid.slice(-6)}`,
                    phone_number: undefined,
                });
                conversation = await this.conversationsService.create({
                    contact_id: contact.id,
                    channel: CHANNEL,
                    external_user_id: psid,
                });
            }
            await this.messagesService.createIfNotExists({
                conversation_id: conversation.id,
                sender_type: 'contact',
                content: text,
                message_type: 'text',
                is_from_whatsapp: false,
                whatsapp_message_id: messageId,
            });
            await this.conversationsService.update(conversation.id, {
                priority: conversation.priority || 'medium',
                last_message_at: new Date(),
            });
            this.logger.log(`Facebook message ${messageId} processed from ${psid}`);
        }
        catch (error) {
            this.logger.error('Error processing Facebook incoming message:', error);
        }
    }
    async sendMessage(psid, text) {
        const tenantId = tenant_context_1.TenantContext.getTenantId();
        const config = await this.integrationsService.getConfigForTenant(tenantId);
        if (!config) {
            throw new common_1.BadRequestException('Facebook Messenger no está configurado para este espacio de trabajo');
        }
        const response = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${encodeURIComponent(config.pageAccessToken)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipient: { id: psid },
                message: { text },
            }),
        });
        const data = await response.json().catch(() => ({}));
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
};
exports.FacebookService = FacebookService;
exports.FacebookService = FacebookService = FacebookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [facebook_integrations_service_1.FacebookIntegrationsService,
        contacts_service_1.ContactsService,
        conversations_service_1.ConversationsService,
        messages_service_1.MessagesService])
], FacebookService);
//# sourceMappingURL=facebook.service.js.map