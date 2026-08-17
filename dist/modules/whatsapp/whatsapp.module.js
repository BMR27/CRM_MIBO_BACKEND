"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const whatsapp_service_1 = require("./whatsapp.service");
const whatsapp_controller_1 = require("./whatsapp.controller");
const whatsapp_integrations_service_1 = require("./whatsapp-integrations.service");
const whatsapp_integration_entity_1 = require("./entities/whatsapp-integration.entity");
const whatsapp_tokens_1 = require("./whatsapp.tokens");
const tenant_scoped_repository_provider_1 = require("../../common/tenant/tenant-scoped-repository.provider");
const contacts_module_1 = require("../contacts/contacts.module");
const conversations_module_1 = require("../conversations/conversations.module");
const messages_module_1 = require("../messages/messages.module");
let WhatsappModule = class WhatsappModule {
};
exports.WhatsappModule = WhatsappModule;
exports.WhatsappModule = WhatsappModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([whatsapp_integration_entity_1.WhatsappIntegration]),
            contacts_module_1.ContactsModule,
            (0, common_1.forwardRef)(() => conversations_module_1.ConversationsModule),
            (0, common_1.forwardRef)(() => messages_module_1.MessagesModule),
        ],
        providers: [
            whatsapp_service_1.WhatsappService,
            whatsapp_integrations_service_1.WhatsappIntegrationsService,
            (0, tenant_scoped_repository_provider_1.tenantScopedRepositoryProvider)(whatsapp_tokens_1.WHATSAPP_INTEGRATION_REPO, whatsapp_integration_entity_1.WhatsappIntegration),
        ],
        controllers: [whatsapp_controller_1.WhatsappController],
        exports: [whatsapp_service_1.WhatsappService, whatsapp_integrations_service_1.WhatsappIntegrationsService],
    })
], WhatsappModule);
//# sourceMappingURL=whatsapp.module.js.map