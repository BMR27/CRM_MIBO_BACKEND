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
exports.ConversationTagsService = void 0;
const common_1 = require("@nestjs/common");
const tenant_scoped_repository_1 = require("../../common/tenant/tenant-scoped.repository");
const conversation_tags_tokens_1 = require("./conversation-tags.tokens");
let ConversationTagsService = class ConversationTagsService {
    constructor(tagRepository) {
        this.tagRepository = tagRepository;
    }
    async create(createTagDto) {
        const tag = this.tagRepository.create(createTagDto);
        return this.tagRepository.save(tag);
    }
    async findAll() {
        return this.tagRepository.find();
    }
    async findOne(id) {
        return this.tagRepository.findOne({
            where: { id },
        });
    }
    async findByConversation(conversationId) {
        return this.tagRepository.find({
            where: { conversation_id: conversationId },
        });
    }
    async remove(id) {
        await this.tagRepository.delete(id);
    }
    async removeByConversation(conversationId) {
        await this.tagRepository.deleteBy({ conversation_id: conversationId });
    }
};
exports.ConversationTagsService = ConversationTagsService;
exports.ConversationTagsService = ConversationTagsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(conversation_tags_tokens_1.CONVERSATION_TAG_REPO)),
    __metadata("design:paramtypes", [tenant_scoped_repository_1.TenantScopedRepository])
], ConversationTagsService);
//# sourceMappingURL=conversation-tags.service.js.map