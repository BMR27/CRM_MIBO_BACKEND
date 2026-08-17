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
exports.CreatePublicLeadDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreatePublicLeadDto {
}
exports.CreatePublicLeadDto = CreatePublicLeadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Juan Pérez' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePublicLeadDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['web', 'api'], description: 'De dónde viene el lead. Por defecto "api".' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['web', 'api']),
    __metadata("design:type", String)
], CreatePublicLeadDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'juan@ejemplo.com' }),
    (0, class_validator_1.ValidateIf)((o) => !o.phone_number),
    (0, class_validator_1.IsEmail)({}, { message: 'email debe ser válido si no se envía phone_number' }),
    __metadata("design:type", String)
], CreatePublicLeadDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+525512345678' }),
    (0, class_validator_1.ValidateIf)((o) => !o.email),
    (0, class_validator_1.IsString)({ message: 'phone_number es requerido si no se envía email' }),
    __metadata("design:type", String)
], CreatePublicLeadDto.prototype, "phone_number", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Acme Inc.' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePublicLeadDto.prototype, "company", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: { utm_source: 'google', page: '/precios' } }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreatePublicLeadDto.prototype, "custom_fields", void 0);
//# sourceMappingURL=create-lead.dto.js.map