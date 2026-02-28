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
exports.ConversationsController = void 0;
const common_1 = require("@nestjs/common");
const conversations_service_1 = require("./conversations.service");
const create_conversation_dto_1 = require("./dto/create-conversation.dto");
const update_conversation_dto_1 = require("./dto/update-conversation.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const messages_service_1 = require("../messages/messages.service");
let ConversationsController = class ConversationsController {
    constructor(conversationsService, messagesService) {
        this.conversationsService = conversationsService;
        this.messagesService = messagesService;
    }
    async getMessages(id) {
        return this.conversationsService.getMessagesByConversation(id);
    }
    create(createConversationDto) {
        return this.conversationsService.create(createConversationDto).then(conversation => ({ conversation }));
    }
    findAll(request) {
        const user = request.user;
        const userRole = user?.role;
        if (userRole === 'agent') {
            return this.conversationsService.findByAssignedAgent(user.id);
        }
        return this.conversationsService.findAll();
    }
    findOne(id) {
        return this.conversationsService.findOne(id);
    }
    findByContact(contactId) {
        return this.conversationsService.findByContact(contactId);
    }
    update(id, updateConversationDto) {
        return this.conversationsService.update(id, updateConversationDto);
    }
    assignAgent(id, body) {
        return this.conversationsService.assignAgent(id, body.agent_id);
    }
    remove(id) {
        return this.conversationsService.remove(id);
    }
    async createMessageForConversation(conversationId, body, req) {
        try {
            console.log('[createMessageForConversation] conversationId:', conversationId);
            console.log('[createMessageForConversation] body:', body);
            console.log('[createMessageForConversation] req.user:', req.user);
            // Validar existencia de conversación
            const conversation = await this.conversationsService.findOne(conversationId);
            if (!conversation) {
                console.error('[createMessageForConversation] No existe la conversación:', conversationId);
                throw new Error('La conversación no existe');
            }
            if (!body.content) {
                throw new Error('El campo content es obligatorio');
            }
            // Si el usuario autenticado es un agente, asignar sender_type 'agent'
            const isAgent = req.user?.role === 'agent' || req.user?.isAgent;
            const createMessageDto = {
                ...body,
                conversation_id: conversationId,
                sender_type: isAgent ? 'agent' : (body.sender_type || 'user'),
                sender_id: body.sender_id || req.user?.id,
                content: body.content,
                message_type: body.message_type || 'text',
            };
            const result = await this.messagesService.create(createMessageDto);
            console.log('[createMessageForConversation] Mensaje creado:', result);
            return result;
        }
        catch (error) {
            console.error('[createMessageForConversation] Error:', error);
            throw error;
        }
    }
};
exports.ConversationsController = ConversationsController;
__decorate([
    (0, common_1.Get)(':id/messages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_conversation_dto_1.CreateConversationDto]),
    __metadata("design:returntype", void 0)
], ConversationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ConversationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConversationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('contact/:contactId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('contactId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConversationsController.prototype, "findByContact", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_conversation_dto_1.UpdateConversationDto]),
    __metadata("design:returntype", void 0)
], ConversationsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/assign'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ConversationsController.prototype, "assignAgent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConversationsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/messages'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], ConversationsController.prototype, "createMessageForConversation", null);
exports.ConversationsController = ConversationsController = __decorate([
    (0, common_1.Controller)('conversations'),
    __metadata("design:paramtypes", [conversations_service_1.ConversationsService,
        messages_service_1.MessagesService])
], ConversationsController);
//# sourceMappingURL=conversations.controller.js.map