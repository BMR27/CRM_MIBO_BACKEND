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
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const messages_service_1 = require("./messages.service");
const create_message_dto_1 = require("./dto/create-message.dto");
const update_message_dto_1 = require("./dto/update-message.dto");
const messages_markRead_1 = require("./messages.markRead");
const swagger_1 = require("@nestjs/swagger");
let MessagesController = class MessagesController {
    constructor(messagesService, messagesMarkReadService) {
        this.messagesService = messagesService;
        this.messagesMarkReadService = messagesMarkReadService;
    }
    create(createMessageDto) {
        return this.messagesService.create(createMessageDto);
    }
    findAll() {
        return this.messagesService.findAll();
    }
    findOne(id) {
        return this.messagesService.findOne(id);
    }
    findByConversation(conversationId) {
        return this.messagesService.findByConversation(conversationId);
    }
    update(id, updateMessageDto) {
        return this.messagesService.update(id, updateMessageDto);
    }
    remove(id) {
        return this.messagesService.remove(id);
    }
    async markConversationMessagesAsRead(conversationId) {
        return this.messagesMarkReadService.markConversationMessagesAsRead(conversationId);
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear mensaje' }),
    (0, swagger_1.ApiBody)({ type: create_message_dto_1.CreateMessageDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Mensaje creado' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_message_dto_1.CreateMessageDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar mensajes' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener mensaje por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del mensaje' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('conversation/:conversationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar mensajes por conversación' }),
    (0, swagger_1.ApiParam)({ name: 'conversationId', description: 'ID de la conversación' }),
    __param(0, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "findByConversation", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar mensaje' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del mensaje' }),
    (0, swagger_1.ApiBody)({ type: update_message_dto_1.UpdateMessageDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_message_dto_1.UpdateMessageDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar mensaje' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del mensaje' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('mark-read/:conversationId'),
    (0, swagger_1.ApiOperation)({ summary: 'Marcar mensajes de una conversación como leídos' }),
    (0, swagger_1.ApiParam)({ name: 'conversationId', description: 'ID de la conversación' }),
    __param(0, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "markConversationMessagesAsRead", null);
exports.MessagesController = MessagesController = __decorate([
    (0, swagger_1.ApiTags)('Messages - Mensajes'),
    (0, common_1.Controller)('messages'),
    __metadata("design:paramtypes", [messages_service_1.MessagesService,
        messages_markRead_1.MessagesMarkReadService])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map