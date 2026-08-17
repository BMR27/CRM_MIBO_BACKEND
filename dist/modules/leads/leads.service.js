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
exports.LeadsService = void 0;
const common_1 = require("@nestjs/common");
const tenant_scoped_repository_1 = require("../../common/tenant/tenant-scoped.repository");
const leads_tokens_1 = require("./leads.tokens");
const contacts_service_1 = require("../contacts/contacts.service");
let LeadsService = class LeadsService {
    constructor(leadRepository, contactsService) {
        this.leadRepository = leadRepository;
        this.contactsService = contactsService;
    }
    async createFromPublic(dto, sourceDetail) {
        const lead = this.leadRepository.create({
            name: dto.name,
            email: dto.email,
            phone_number: dto.phone_number,
            company: dto.company,
            custom_fields: dto.custom_fields,
            source: dto.source || 'api',
            source_detail: sourceDetail,
            status: 'new',
        });
        return this.leadRepository.save(lead);
    }
    async findAll() {
        return this.leadRepository.find({ order: { created_at: 'DESC' } });
    }
    async findOne(id) {
        const lead = await this.leadRepository.findOne({ where: { id } });
        if (!lead)
            throw new common_1.NotFoundException('Lead no encontrado');
        return lead;
    }
    async update(id, dto) {
        await this.leadRepository.update(id, dto);
        return this.findOne(id);
    }
    async convertToContact(id) {
        const lead = await this.findOne(id);
        if (lead.contact_id) {
            return { lead, alreadyConverted: true };
        }
        if (!lead.phone_number) {
            throw new common_1.BadRequestException('El lead no tiene phone_number, no se puede convertir a contacto');
        }
        const contact = await this.contactsService.findOrCreateByPhone(lead.phone_number);
        await this.leadRepository.update(id, { contact_id: contact.id, status: 'converted' });
        return { lead: await this.findOne(id), contact, alreadyConverted: false };
    }
};
exports.LeadsService = LeadsService;
exports.LeadsService = LeadsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(leads_tokens_1.LEAD_REPO)),
    __metadata("design:paramtypes", [tenant_scoped_repository_1.TenantScopedRepository,
        contacts_service_1.ContactsService])
], LeadsService);
//# sourceMappingURL=leads.service.js.map