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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationsService = void 0;
const common_1 = require("@nestjs/common");
const messages_service_1 = require("../messages/messages.service");
const tenant_scoped_repository_1 = require("../../common/tenant/tenant-scoped.repository");
const conversations_tokens_1 = require("./conversations.tokens");
let ConversationsService = class ConversationsService {
    constructor(conversationRepository, messagesService) {
        this.conversationRepository = conversationRepository;
        this.messagesService = messagesService;
    }
    async getMessagesByConversation(conversationId) {
        // Usar el servicio inyectado para obtener los mensajes correctamente ordenados y con media_proxy_url
        return await this.messagesService.findByConversation(conversationId);
    }
    async create(createConversationDto) {
        const conversation = this.conversationRepository.create(createConversationDto);
        return this.conversationRepository.save(conversation);
    }
    async findAll() {
        const conversations = await this.conversationRepository.find({
            relations: ['contact', 'assigned_agent', 'messages'],
            order: { last_message_at: 'DESC' },
        });
        // Agregar campo last_message y unread_count
        return conversations.map(conv => {
            let lastMsg = null;
            let unreadCount = 0;
            if (conv.messages && conv.messages.length > 0) {
                // Ordenar por fecha si no está ordenado
                const sorted = [...conv.messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                lastMsg = sorted[0].content;
                // Contar mensajes no leídos de tipo 'contact'
                unreadCount = conv.messages.filter(m => m.is_read === false && m.sender_type === 'contact').length;
            }
            return {
                ...conv,
                last_message: lastMsg,
                unread_count: unreadCount,
            };
        });
    }
    async findOne(id) {
        const conversation = await this.conversationRepository.findOne({
            where: { id },
            relations: ['contact', 'assigned_agent', 'messages'],
        });
        if (!conversation) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        // Mapeo explícito para frontend
        return {
            id: conversation.id,
            priority: conversation.priority,
            status: conversation.status,
            contact: conversation.contact,
            assigned_agent: conversation.assigned_agent,
            messages: conversation.messages,
            updated_at: conversation.updated_at,
            created_at: conversation.created_at,
        };
    }
    async findByContact(contactId) {
        return this.conversationRepository.find({
            where: { contact_id: contactId },
            relations: ['assigned_agent'],
        });
    }
    async findByExternalUserId(channel, externalUserId) {
        return this.conversationRepository.find({
            where: { channel, external_user_id: externalUserId },
            relations: ['assigned_agent', 'contact'],
        });
    }
    async findByAssignedAgent(agentId) {
        // Mostrar conversaciones asignadas al agente o sin asignación
        return this.conversationRepository.find({
            where: [
                { assigned_agent_id: agentId },
                { assigned_agent_id: null },
            ],
            relations: ['contact', 'assigned_agent', 'messages'],
            order: { last_message_at: 'DESC' },
        });
    }
    async assignAgent(conversationId, agentId) {
        await this.conversationRepository.update(conversationId, {
            assigned_agent_id: agentId,
        });
        return this.findOne(conversationId);
    }
    async update(id, updateConversationDto) {
        await this.conversationRepository.update(id, updateConversationDto);
        return this.findOne(id);
    }
    async remove(id) {
        await this.conversationRepository.delete(id);
        return { success: true };
    }
};
exports.ConversationsService = ConversationsService;
exports.ConversationsService = ConversationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(conversations_tokens_1.CONVERSATION_REPO)),
    __metadata("design:paramtypes", [tenant_scoped_repository_1.TenantScopedRepository,
        messages_service_1.MessagesService])
], ConversationsService);
//# sourceMappingURL=conversations.service.js.map