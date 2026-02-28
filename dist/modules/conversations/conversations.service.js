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
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const conversation_entity_1 = require("./entities/conversation.entity");
let ConversationsService = class ConversationsService {
    constructor(conversationRepository) {
        this.conversationRepository = conversationRepository;
    }
    async getMessagesByConversation(conversationId) {
        const conv = await this.conversationRepository.findOne({
            where: { id: conversationId },
            relations: ['messages'],
        });
        return conv?.messages || [];
    }
    async create(createConversationDto) {
        const conversation = this.conversationRepository.create(createConversationDto);
        return this.conversationRepository.save(conversation);
    }
    async findAll() {
        return this.conversationRepository.find({
            relations: ['contact', 'assigned_agent', 'messages'],
        });
    }
    async findOne(id) {
        const conversation = await this.conversationRepository.findOne({
            where: { id },
            relations: ['contact', 'assigned_agent', 'messages'],
        });
        if (!conversation) {
            // Usar NotFoundException para que el backend retorne 404
            // y el frontend pueda manejarlo correctamente
            // Importar NotFoundException si no está
            // import { NotFoundException } from '@nestjs/common';
            throw new (require('@nestjs/common').NotFoundException)('Conversation not found');
        }
        return conversation;
    }
    async findByContact(contactId) {
        return this.conversationRepository.find({
            where: { contact_id: contactId },
            relations: ['assigned_agent'],
        });
    }
    async findByAssignedAgent(agentId) {
        return this.conversationRepository.find({
            where: { assigned_agent_id: agentId },
            relations: ['contact', 'assigned_agent', 'messages'],
            order: { updated_at: 'DESC' },
        });
    }
    async assignAgent(conversationId, agentId) {
        await this.conversationRepository.update(conversationId, {
            assigned_agent_id: agentId,
        });
        return this.findOne(conversationId);
    }
    async update(id, updateConversationDto) {
        const updateData = this.conversationRepository.create(updateConversationDto);
        await this.conversationRepository.update(id, updateData);
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
    __param(0, (0, typeorm_1.InjectRepository)(conversation_entity_1.Conversation)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ConversationsService);
//# sourceMappingURL=conversations.service.js.map