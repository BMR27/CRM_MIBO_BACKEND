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
exports.Contact = void 0;
const typeorm_1 = require("typeorm");
const conversation_entity_1 = require("../../conversations/entities/conversation.entity");
const order_entity_1 = require("../../orders/entities/order.entity");
let Contact = class Contact {
};
exports.Contact = Contact;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Contact.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true, nullable: true }),
    __metadata("design:type", String)
], Contact.prototype, "phone_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Contact.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], Contact.prototype, "avatar_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Contact.prototype, "last_seen", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Contact.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Contact.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => conversation_entity_1.Conversation, (conv) => conv.contact),
    __metadata("design:type", Array)
], Contact.prototype, "conversations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => order_entity_1.Order, (order) => order.contact),
    __metadata("design:type", Array)
], Contact.prototype, "orders", void 0);
exports.Contact = Contact = __decorate([
    (0, typeorm_1.Entity)('contacts')
], Contact);
//# sourceMappingURL=contact.entity.js.map