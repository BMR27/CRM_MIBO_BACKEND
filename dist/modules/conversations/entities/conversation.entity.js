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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const typeorm_1 = require("typeorm");
const contact_entity_1 = require("../../contacts/entities/contact.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const message_entity_1 = require("../../messages/entities/message.entity");
const conversation_tag_entity_1 = require("../../conversation-tags/entities/conversation-tag.entity");
let Conversation = class Conversation {
};
exports.Conversation = Conversation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Conversation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Conversation.prototype, "contact_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Conversation.prototype, "assigned_agent_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'paused', 'resolved'],
        default: 'active',
    }),
    __metadata("design:type", String)
], Conversation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    }),
    __metadata("design:type", String)
], Conversation.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Conversation.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Conversation.prototype, "last_message_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Conversation.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Conversation.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => contact_entity_1.Contact, (contact) => contact.conversations),
    (0, typeorm_1.JoinColumn)({ name: 'contact_id' }),
    __metadata("design:type", contact_entity_1.Contact)
], Conversation.prototype, "contact", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.assigned_conversations, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_agent_id' }),
    __metadata("design:type", user_entity_1.User)
], Conversation.prototype, "assigned_agent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, (msg) => msg.conversation),
    __metadata("design:type", Array)
], Conversation.prototype, "messages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => conversation_tag_entity_1.ConversationTag, (tag) => tag.conversation),
    __metadata("design:type", Array)
], Conversation.prototype, "tags", void 0);
exports.Conversation = Conversation = __decorate([
    (0, typeorm_1.Entity)('conversations')
], Conversation);
//# sourceMappingURL=conversation.entity.js.map