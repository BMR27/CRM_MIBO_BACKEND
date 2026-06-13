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
exports.CreateMessageDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateMessageDto {
}
exports.CreateMessageDto = CreateMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-conversacion' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "conversation_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['user', 'contact', 'agent'], example: 'agent' }),
    (0, class_validator_1.IsEnum)(['user', 'contact']),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "sender_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-usuario' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "sender_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Hola, gracias por contactarnos.' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['text', 'image', 'document', 'audio', 'video', 'sticker'], example: 'text' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['text', 'image', 'document', 'audio', 'video', 'sticker']),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "message_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'MEaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "media_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'application/pdf' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "media_mime_type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'sha256-hash' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "media_sha256", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'archivo.pdf' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "media_filename", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Adjunto comprobante' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "media_caption", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'https://example.com/archivo.pdf' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "media_url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        type: 'object',
        example: { campaignId: 'bulk_1710000000000', source: 'bulk' },
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateMessageDto.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2026-06-12T15:00:00.000Z' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateMessageDto.prototype, "created_at", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateMessageDto.prototype, "is_from_whatsapp", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateMessageDto.prototype, "whatsapp_message_id", void 0);
//# sourceMappingURL=create-message.dto.js.map