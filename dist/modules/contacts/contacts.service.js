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
exports.ContactsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contact_entity_1 = require("./entities/contact.entity");
let ContactsService = class ContactsService {
    constructor(contactRepository) {
        this.contactRepository = contactRepository;
    }
    async create(createContactDto) {
        const contact = this.contactRepository.create(createContactDto);
        return this.contactRepository.save(contact);
    }
    async findAll() {
        return this.contactRepository.find();
    }
    async findOne(id) {
        return this.contactRepository.findOne({
            where: { id },
        });
    }
    async findByPhoneNumber(phoneNumber) {
        return this.contactRepository.findOne({
            where: { phone_number: phoneNumber },
        });
    }
    async findOrCreateByPhone(phoneNumber) {
        let contact = await this.findByPhoneNumber(phoneNumber);
        if (!contact) {
            contact = await this.create({
                phone_number: phoneNumber,
                name: phoneNumber, // Usar el tel�fono como nombre inicial
            });
        }
        return contact;
    }
    async update(id, updateContactDto) {
        await this.contactRepository.update(id, updateContactDto);
        return this.findOne(id);
    }
    async updateLastSeen(id) {
        await this.contactRepository.update(id, {
            last_seen: new Date(),
        });
    }
    async remove(id) {
        await this.contactRepository.delete(id);
    }
};
exports.ContactsService = ContactsService;
exports.ContactsService = ContactsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contact_entity_1.Contact)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ContactsService);
//# sourceMappingURL=contacts.service.js.map