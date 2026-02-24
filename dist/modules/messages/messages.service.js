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
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const message_entity_1 = require("./entities/message.entity");
let MessagesService = class MessagesService {
    constructor(messageRepository) {
        this.messageRepository = messageRepository;
    }
    attachMediaProxyUrl(messageOrMessages) {
        if (!messageOrMessages)
            return messageOrMessages;
        if (Array.isArray(messageOrMessages)) {
            return messageOrMessages.map((m) => this.attachMediaProxyUrl(m));
        }
        const mediaId = messageOrMessages.media_id;
        if (!mediaId)
            return messageOrMessages;
        const filename = messageOrMessages.media_filename || '';
        let mediaProxyUrl = `/api/whatsapp/media/${encodeURIComponent(mediaId)}`;
        if (filename.trim().length > 0) {
            mediaProxyUrl += `?filename=${encodeURIComponent(filename)}`;
        }
        return {
            ...messageOrMessages,
            media_proxy_url: mediaProxyUrl,
        };
    }
    async create(createMessageDto) {
        const message = this.messageRepository.create(createMessageDto);
        const saved = await this.messageRepository.save(message);
        return this.attachMediaProxyUrl(saved);
    }
    async findAll() {
        const messages = await this.messageRepository.find({
            relations: ['conversation', 'sender'],
        });
        return messages.map(m => this.attachMediaProxyUrl(m));
    }
    async findOne(id) {
        const message = await this.messageRepository.findOne({
            where: { id },
            relations: ['conversation', 'sender'],
        });
        return this.attachMediaProxyUrl(message);
    }
    async findByConversation(conversationId) {
        const messages = await this.messageRepository.find({
            where: { conversation_id: conversationId },
            relations: ['sender'],
            order: { created_at: 'ASC' },
        });
        return messages.map(m => this.attachMediaProxyUrl(m));
    }
    async update(id, updateMessageDto) {
        const updateData = this.messageRepository.create(updateMessageDto);
        await this.messageRepository.update(id, updateData);
        const message = await this.findOne(id);
        return this.attachMediaProxyUrl(message);
    }
    async remove(id) {
        await this.messageRepository.delete(id);
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], MessagesService);
//# sourceMappingURL=messages.service.js.map