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
exports.ConversationTagsController = void 0;
const common_1 = require("@nestjs/common");
const conversation_tags_service_1 = require("./conversation-tags.service");
const create_conversation_tag_dto_1 = require("./dto/create-conversation-tag.dto");
let ConversationTagsController = class ConversationTagsController {
    constructor(conversationTagsService) {
        this.conversationTagsService = conversationTagsService;
    }
    create(createTagDto) {
        return this.conversationTagsService.create(createTagDto);
    }
    findAll() {
        return this.conversationTagsService.findAll();
    }
    findOne(id) {
        return this.conversationTagsService.findOne(id);
    }
    findByConversation(conversationId) {
        return this.conversationTagsService.findByConversation(conversationId);
    }
    remove(id) {
        return this.conversationTagsService.remove(id);
    }
};
exports.ConversationTagsController = ConversationTagsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_conversation_tag_dto_1.CreateConversationTagDto]),
    __metadata("design:returntype", void 0)
], ConversationTagsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConversationTagsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConversationTagsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('conversation/:conversationId'),
    __param(0, (0, common_1.Param)('conversationId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConversationTagsController.prototype, "findByConversation", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConversationTagsController.prototype, "remove", null);
exports.ConversationTagsController = ConversationTagsController = __decorate([
    (0, common_1.Controller)('api/conversation-tags'),
    __metadata("design:paramtypes", [conversation_tags_service_1.ConversationTagsService])
], ConversationTagsController);
//# sourceMappingURL=conversation-tags.controller.js.map