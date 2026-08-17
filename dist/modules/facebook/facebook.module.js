"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const facebook_service_1 = require("./facebook.service");
const facebook_controller_1 = require("./facebook.controller");
const facebook_integrations_service_1 = require("./facebook-integrations.service");
const facebook_integration_entity_1 = require("./entities/facebook-integration.entity");
const facebook_tokens_1 = require("./facebook.tokens");
const tenant_scoped_repository_provider_1 = require("../../common/tenant/tenant-scoped-repository.provider");
const contacts_module_1 = require("../contacts/contacts.module");
const conversations_module_1 = require("../conversations/conversations.module");
const messages_module_1 = require("../messages/messages.module");
let FacebookModule = class FacebookModule {
};
exports.FacebookModule = FacebookModule;
exports.FacebookModule = FacebookModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([facebook_integration_entity_1.FacebookIntegration]),
            contacts_module_1.ContactsModule,
            (0, common_1.forwardRef)(() => conversations_module_1.ConversationsModule),
            messages_module_1.MessagesModule,
        ],
        providers: [
            facebook_service_1.FacebookService,
            facebook_integrations_service_1.FacebookIntegrationsService,
            (0, tenant_scoped_repository_provider_1.tenantScopedRepositoryProvider)(facebook_tokens_1.FACEBOOK_INTEGRATION_REPO, facebook_integration_entity_1.FacebookIntegration),
        ],
        controllers: [facebook_controller_1.FacebookController],
        exports: [facebook_service_1.FacebookService, facebook_integrations_service_1.FacebookIntegrationsService],
    })
], FacebookModule);
//# sourceMappingURL=facebook.module.js.map