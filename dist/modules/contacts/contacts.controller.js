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
exports.ContactsController = void 0;
const common_1 = require("@nestjs/common");
const contacts_service_1 = require("./contacts.service");
const create_contact_dto_1 = require("./dto/create-contact.dto");
const update_contact_dto_1 = require("./dto/update-contact.dto");
const swagger_1 = require("@nestjs/swagger");
let ContactsController = class ContactsController {
    constructor(contactsService) {
        this.contactsService = contactsService;
    }
    create(createContactDto) {
        return this.contactsService.create(createContactDto);
    }
    findAll() {
        return this.contactsService.findAll();
    }
    findOne(id) {
        return this.contactsService.findOne(id);
    }
    findByPhone(phone) {
        return this.contactsService.findByPhoneNumber(phone);
    }
    update(id, updateContactDto) {
        console.log('[ContactsController] PATCH /contacts/:id', { id, updateContactDto });
        return this.contactsService.update(id, updateContactDto);
    }
    remove(id) {
        console.log('[ContactsController] DELETE /contacts/:id', { id });
        return this.contactsService.remove(id);
    }
};
exports.ContactsController = ContactsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear contacto' }),
    (0, swagger_1.ApiBody)({ type: create_contact_dto_1.CreateContactDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Contacto creado' }),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_contact_dto_1.CreateContactDto]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar contactos' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de contactos' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener contacto por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del contacto' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('phone/:phone'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar contacto por teléfono' }),
    (0, swagger_1.ApiParam)({ name: 'phone', description: 'Teléfono en formato internacional', example: '+525512345678' }),
    __param(0, (0, common_1.Param)('phone')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "findByPhone", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar contacto' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del contacto' }),
    (0, swagger_1.ApiBody)({ type: update_contact_dto_1.UpdateContactDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_contact_dto_1.UpdateContactDto]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar contacto' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del contacto' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "remove", null);
exports.ContactsController = ContactsController = __decorate([
    (0, swagger_1.ApiTags)('Contacts - Contactos'),
    (0, common_1.Controller)('api/contacts'),
    __metadata("design:paramtypes", [contacts_service_1.ContactsService])
], ContactsController);
//# sourceMappingURL=contacts.controller.js.map