"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const voice_service_1 = require("./voice.service");
const voice_controller_1 = require("./voice.controller");
const voice_integrations_service_1 = require("./voice-integrations.service");
const voice_integration_entity_1 = require("./entities/voice-integration.entity");
const call_entity_1 = require("./entities/call.entity");
const voice_tokens_1 = require("./voice.tokens");
const tenant_scoped_repository_provider_1 = require("../../common/tenant/tenant-scoped-repository.provider");
const contacts_module_1 = require("../contacts/contacts.module");
const conversations_module_1 = require("../conversations/conversations.module");
let VoiceModule = class VoiceModule {
};
exports.VoiceModule = VoiceModule;
exports.VoiceModule = VoiceModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([voice_integration_entity_1.VoiceIntegration, call_entity_1.Call]), contacts_module_1.ContactsModule, conversations_module_1.ConversationsModule],
        providers: [
            voice_service_1.VoiceService,
            voice_integrations_service_1.VoiceIntegrationsService,
            (0, tenant_scoped_repository_provider_1.tenantScopedRepositoryProvider)(voice_tokens_1.VOICE_INTEGRATION_REPO, voice_integration_entity_1.VoiceIntegration),
            (0, tenant_scoped_repository_provider_1.tenantScopedRepositoryProvider)(voice_tokens_1.CALL_REPO, call_entity_1.Call),
        ],
        controllers: [voice_controller_1.VoiceController],
        exports: [voice_service_1.VoiceService, voice_integrations_service_1.VoiceIntegrationsService],
    })
], VoiceModule);
//# sourceMappingURL=voice.module.js.map