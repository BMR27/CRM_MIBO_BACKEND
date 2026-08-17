"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const lead_entity_1 = require("./entities/lead.entity");
const leads_service_1 = require("./leads.service");
const leads_controller_1 = require("./leads.controller");
const leads_tokens_1 = require("./leads.tokens");
const tenant_scoped_repository_provider_1 = require("../../common/tenant/tenant-scoped-repository.provider");
const api_keys_module_1 = require("../api-keys/api-keys.module");
const contacts_module_1 = require("../contacts/contacts.module");
let LeadsModule = class LeadsModule {
};
exports.LeadsModule = LeadsModule;
exports.LeadsModule = LeadsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([lead_entity_1.Lead]),
            throttler_1.ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
            api_keys_module_1.ApiKeysModule,
            contacts_module_1.ContactsModule,
        ],
        providers: [leads_service_1.LeadsService, (0, tenant_scoped_repository_provider_1.tenantScopedRepositoryProvider)(leads_tokens_1.LEAD_REPO, lead_entity_1.Lead)],
        controllers: [leads_controller_1.LeadsController],
        exports: [leads_service_1.LeadsService],
    })
], LeadsModule);
//# sourceMappingURL=leads.module.js.map