"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MacrosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const macro_entity_1 = require("./entities/macro.entity");
const macros_service_1 = require("./macros.service");
const macros_controller_1 = require("./macros.controller");
const macros_tokens_1 = require("./macros.tokens");
const tenant_scoped_repository_provider_1 = require("../../common/tenant/tenant-scoped-repository.provider");
let MacrosModule = class MacrosModule {
};
exports.MacrosModule = MacrosModule;
exports.MacrosModule = MacrosModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([macro_entity_1.Macro])],
        providers: [macros_service_1.MacrosService, (0, tenant_scoped_repository_provider_1.tenantScopedRepositoryProvider)(macros_tokens_1.MACRO_REPO, macro_entity_1.Macro)],
        controllers: [macros_controller_1.MacrosController],
        exports: [macros_service_1.MacrosService],
    })
], MacrosModule);
//# sourceMappingURL=macros.module.js.map