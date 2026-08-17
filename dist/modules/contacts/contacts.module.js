"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const contact_entity_1 = require("./entities/contact.entity");
const contacts_service_1 = require("./contacts.service");
const contacts_controller_1 = require("./contacts.controller");
const contacts_tokens_1 = require("./contacts.tokens");
const tenant_scoped_repository_provider_1 = require("../../common/tenant/tenant-scoped-repository.provider");
let ContactsModule = class ContactsModule {
};
exports.ContactsModule = ContactsModule;
exports.ContactsModule = ContactsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([contact_entity_1.Contact])],
        providers: [contacts_service_1.ContactsService, (0, tenant_scoped_repository_provider_1.tenantScopedRepositoryProvider)(contacts_tokens_1.CONTACT_REPO, contact_entity_1.Contact)],
        controllers: [contacts_controller_1.ContactsController],
        exports: [contacts_service_1.ContactsService],
    })
], ContactsModule);
//# sourceMappingURL=contacts.module.js.map