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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const conversation_entity_1 = require("../../conversations/entities/conversation.entity");
const message_entity_1 = require("../../messages/entities/message.entity");
const macro_entity_1 = require("../../macros/entities/macro.entity");
const role_entity_1 = require("../../roles/entities/role.entity");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], User.prototype, "password_hash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "role_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => role_entity_1.Role, (role) => role.users),
    (0, typeorm_1.JoinColumn)({ name: 'role_id' }),
    __metadata("design:type", role_entity_1.Role)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "avatar_url", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['available', 'busy', 'offline'],
        default: 'offline',
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => conversation_entity_1.Conversation, (conv) => conv.assigned_agent),
    __metadata("design:type", Array)
], User.prototype, "assigned_conversations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => message_entity_1.Message, (msg) => msg.sender),
    __metadata("design:type", Array)
], User.prototype, "sent_messages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => macro_entity_1.Macro, (macro) => macro.created_by),
    __metadata("design:type", Array)
], User.prototype, "created_macros", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=user.entity.js.map